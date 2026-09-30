package migrations

import (
	"fmt"
	"slices"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Materials become a catalogue shared by every activity, and what an activity needs of one is a
// row of its own.
//
// `activities_materials` held one row per activity and name, the quantity on it. It is renamed
// `materials` and keeps the name only — one row per distinct name, told apart case-insensitively,
// the first spelling kept. A new `activities_materials` links an activity to a catalogue row and
// carries the quantity. It cascades with both: deleting an activity or a catalogue row deletes
// the links.
//
// The activity's list, its steps and its workshops point at those links rather than at the
// catalogue. None of them cascades, so deleting a link — taking a material off an activity —
// drops it from the steps and workshops that recalled it, with nothing for the client to write.
func init() {
	m.Register(materialsBecomeACatalogue, materialsBackToActivities)
}

const materialsCollection = "materials"

// The collections whose `materials` field is re-pointed, activities first.
var materialHolders = []string{activitiesCollection, activityStepsCollection, workshopsCollection}

func materialsBecomeACatalogue(app core.App) error {
	catalogue, err := app.FindCollectionByNameOrId(activityMaterialsCollection)
	if err != nil {
		return err
	}

	rows, err := app.FindAllRecords(catalogue)
	if err != nil {
		return err
	}
	rowsById := map[string]*core.Record{}
	for _, row := range rows {
		rowsById[row.Id] = row
	}

	held, err := readMaterialLinks(app)
	if err != nil {
		return err
	}

	// The relation's target cannot change in place, so each field is dropped and added anew.
	if err := dropMaterialFields(app); err != nil {
		return err
	}

	catalogue.Name = materialsCollection
	catalogue.Fields.RemoveByName("quantity")
	if err := app.Save(catalogue); err != nil {
		return err
	}

	links := core.NewBaseCollection(activityMaterialsCollection)
	openToEveryone(links)
	links.Fields.Add(
		&core.RelationField{Name: "activity", CollectionId: held.activities.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
		&core.RelationField{Name: "material", CollectionId: catalogue.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
		// Free text rather than a number: "one per child" is a quantity too.
		&core.TextField{Name: "quantity"},
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
	if err := app.Save(links); err != nil {
		return err
	}

	if err := addMaterialFields(app, links.Id); err != nil {
		return err
	}

	// The catalogue row each name keeps: the first one an activity lists, then the unlisted ones.
	canonical := map[string]string{}
	keep := func(row *core.Record) string {
		key := materialKey(row.GetString("name"))
		if id, known := canonical[key]; known {
			return id
		}
		canonical[key] = row.Id
		return row.Id
	}
	for _, activity := range held.records[activitiesCollection] {
		for _, id := range held.materials[activity.Id] {
			if row, ok := rowsById[id]; ok {
				keep(row)
			}
		}
	}
	for _, row := range rows {
		keep(row)
	}

	// One link per activity and catalogue row, made the first time the activity, one of its steps
	// or one of its workshops names it.
	linkIds := map[string]map[string]string{}
	listed := map[string][]string{}
	link := func(activity string, old string) (string, error) {
		row, ok := rowsById[old]
		if !ok {
			return "", nil // a dangling id: nothing to carry over
		}
		material := canonical[materialKey(row.GetString("name"))]
		if id, known := linkIds[activity][material]; known {
			return id, nil
		}

		record := core.NewRecord(links)
		record.Set("activity", activity)
		record.Set("material", material)
		record.Set("quantity", row.GetString("quantity"))
		if err := app.Save(record); err != nil {
			return "", fmt.Errorf("activity %s, material %q: %w", activity, row.GetString("name"), err)
		}

		if linkIds[activity] == nil {
			linkIds[activity] = map[string]string{}
		}
		linkIds[activity][material] = record.Id
		listed[activity] = append(listed[activity], record.Id)
		return record.Id, nil
	}

	for _, activity := range held.records[activitiesCollection] {
		for _, old := range held.materials[activity.Id] {
			if _, err := link(activity.Id, old); err != nil {
				return err
			}
		}
	}

	for _, holder := range []string{activityStepsCollection, workshopsCollection} {
		for _, record := range held.records[holder] {
			var recalled []string
			for _, old := range held.materials[record.Id] {
				id, err := link(record.GetString("activity"), old)
				if err != nil {
					return err
				}
				if id != "" && !slices.Contains(recalled, id) {
					recalled = append(recalled, id)
				}
			}
			if err := setMaterials(app, record, recalled); err != nil {
				return err
			}
		}
	}

	// Last, since a step may have named a material its activity's list had lost.
	for _, activity := range held.records[activitiesCollection] {
		if err := setMaterials(app, activity, listed[activity.Id]); err != nil {
			return err
		}
	}

	kept := map[string]bool{}
	for _, id := range canonical {
		kept[id] = true
	}
	for _, row := range rows {
		if kept[row.Id] {
			continue
		}
		if err := app.Delete(row); err != nil {
			return fmt.Errorf("duplicate material %s: %w", row.Id, err)
		}
	}

	catalogue.AddIndex("idx_materials_name", true, "`name` COLLATE NOCASE", "")
	return app.Save(catalogue)
}

func materialsBackToActivities(app core.App) error {
	catalogue, err := app.FindCollectionByNameOrId(materialsCollection)
	if err != nil {
		return err
	}
	links, err := app.FindCollectionByNameOrId(activityMaterialsCollection)
	if err != nil {
		return err
	}

	names := map[string]string{}
	originals, err := app.FindAllRecords(catalogue)
	if err != nil {
		return err
	}
	for _, row := range originals {
		names[row.Id] = row.GetString("name")
	}

	linkRecords, err := app.FindAllRecords(links)
	if err != nil {
		return err
	}
	type need struct{ name, quantity string }
	needs := map[string]need{}
	for _, record := range linkRecords {
		needs[record.Id] = need{names[record.GetString("material")], record.GetString("quantity")}
	}

	held, err := readMaterialLinks(app)
	if err != nil {
		return err
	}

	if err := dropMaterialFields(app); err != nil {
		return err
	}
	if err := app.Delete(links); err != nil {
		return err
	}

	catalogue.RemoveIndex("idx_materials_name")
	catalogue.Name = activityMaterialsCollection
	catalogue.Fields.Add(&core.TextField{Name: "quantity"})
	if err := app.Save(catalogue); err != nil {
		return err
	}

	if err := addMaterialFields(app, catalogue.Id); err != nil {
		return err
	}

	// Each link becomes a row of the activity's own again, the way the catalogue rows were
	// before they were shared.
	rowOf := map[string]string{}
	for id, need := range needs {
		row := core.NewRecord(catalogue)
		row.Set("name", need.name)
		row.Set("quantity", need.quantity)
		if err := app.Save(row); err != nil {
			return fmt.Errorf("material %q: %w", need.name, err)
		}
		rowOf[id] = row.Id
	}

	for _, holder := range materialHolders {
		for _, record := range held.records[holder] {
			var rows []string
			for _, id := range held.materials[record.Id] {
				if row, ok := rowOf[id]; ok {
					rows = append(rows, row)
				}
			}
			if err := setMaterials(app, record, rows); err != nil {
				return err
			}
		}
	}

	for _, row := range originals {
		if err := app.Delete(row); err != nil {
			return fmt.Errorf("catalogue material %s: %w", row.Id, err)
		}
	}

	return nil
}

// materialLinks is what every holder's `materials` field says, read before the field is dropped.
type materialLinks struct {
	activities *core.Collection
	records    map[string][]*core.Record
	materials  map[string][]string
}

func readMaterialLinks(app core.App) (materialLinks, error) {
	held := materialLinks{records: map[string][]*core.Record{}, materials: map[string][]string{}}

	for _, holder := range materialHolders {
		collection, err := app.FindCollectionByNameOrId(holder)
		if err != nil {
			return held, err
		}
		if holder == activitiesCollection {
			held.activities = collection
		}

		records, err := app.FindAllRecords(collection)
		if err != nil {
			return held, err
		}
		held.records[holder] = records
		for _, record := range records {
			held.materials[record.Id] = record.GetStringSlice("materials")
		}
	}

	return held, nil
}

func dropMaterialFields(app core.App) error {
	for _, holder := range materialHolders {
		collection, err := app.FindCollectionByNameOrId(holder)
		if err != nil {
			return err
		}
		collection.Fields.RemoveByName("materials")
		if err := app.Save(collection); err != nil {
			return err
		}
	}
	return nil
}

func addMaterialFields(app core.App, target string) error {
	for _, holder := range materialHolders {
		collection, err := app.FindCollectionByNameOrId(holder)
		if err != nil {
			return err
		}
		collection.Fields.Add(&core.RelationField{Name: "materials", CollectionId: target, MaxSelect: 999})
		if err := app.Save(collection); err != nil {
			return err
		}
	}
	return nil
}

// setMaterials writes a holder's list without validating the rest of the record, which a
// migration has no business failing on.
func setMaterials(app core.App, record *core.Record, ids []string) error {
	fresh, err := app.FindRecordById(record.Collection().Name, record.Id)
	if err != nil {
		return err
	}
	fresh.Set("materials", ids)
	if err := app.SaveNoValidate(fresh); err != nil {
		return fmt.Errorf("%s %s: %w", record.Collection().Name, record.Id, err)
	}
	return nil
}

func materialKey(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}
