package migrations

import (
	"fmt"
	"slices"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Safety tags leave `tags` for a collection of their own, `safety_instructions`. They were the
// only kind with a `description` — the precautions they stand for — which is the case ADR 0014
// left open: a kind needing columns of its own moves back out. `tags` loses `description` and
// the SECURITY kind with them.
//
// Ids are kept, so the links carry over: `activities.safety_tags` becomes
// `activities.safety_instructions`, pointing at the new collection. Like the tags, the
// instructions are reference data: anyone may read them, a superuser writes them.
func init() {
	m.Register(safetyInstructionsOutOfTags, safetyInstructionsBackIntoTags)
}

const (
	// `tagsCollection` is the name the catalogue had before `1790770000_tags_collection_renamed.go`.
	tagCatalogue                 = "tags"
	safetyInstructionsCollection = "safety_instructions"
	safetyTagsField              = "safety_tags"
	safetyTagType                = "SECURITY"
)

func safetyInstructionsOutOfTags(app core.App) error {
	tags, err := app.FindCollectionByNameOrId(tagCatalogue)
	if err != nil {
		return err
	}
	safetyTags, err := app.FindRecordsByFilter(tags, "type = {:type}", "", 0, 0, dbx.Params{"type": safetyTagType})
	if err != nil {
		return err
	}

	instructions := core.NewBaseCollection(safetyInstructionsCollection)
	instructions.ListRule = pointer("")
	instructions.ViewRule = pointer("")
	instructions.Fields.Add(
		&core.TextField{Name: "slug", Required: true, Pattern: `^[a-z0-9-]+$`},
		&core.TextField{Name: "name", Required: true},
		&core.EditorField{Name: "description"},
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
	instructions.AddIndex("idx_safety_instructions_slug", true, "`slug`", "")
	if err := app.Save(instructions); err != nil {
		return err
	}

	for _, tag := range safetyTags {
		instruction := core.NewRecord(instructions)
		instruction.Id = tag.Id
		instruction.Set("slug", tag.GetString("slug"))
		instruction.Set("name", tag.GetString("name"))
		instruction.Set("description", tag.GetString("description"))
		if err := app.Save(instruction); err != nil {
			return fmt.Errorf("safety tag %s: %w", tag.Id, err)
		}
	}

	if err := moveRelation(app, activitiesCollection, safetyTagsField, safetyInstructionsCollection, instructions.Id); err != nil {
		return err
	}

	// Unlinked from every activity by now, so deleting them takes nothing with them.
	for _, tag := range safetyTags {
		if err := app.Delete(tag); err != nil {
			return fmt.Errorf("safety tag %s: %w", tag.Id, err)
		}
	}

	typeField := tags.Fields.GetByName("type").(*core.SelectField)
	typeField.Values = slices.DeleteFunc(slices.Clone(typeField.Values), func(kind string) bool {
		return kind == safetyTagType
	})
	tags.Fields.RemoveByName("description")

	return app.Save(tags)
}

func safetyInstructionsBackIntoTags(app core.App) error {
	tags, err := app.FindCollectionByNameOrId(tagCatalogue)
	if err != nil {
		return err
	}

	tags.Fields.GetByName("type").(*core.SelectField).Values = slices.Clone(tagTypesAfter)
	tags.Fields.AddAt(fieldPosition(tags, "name")+1, &core.EditorField{Name: "description"})
	if err := app.Save(tags); err != nil {
		return err
	}

	instructions, err := app.FindAllRecords(safetyInstructionsCollection)
	if err != nil {
		return err
	}
	for _, instruction := range instructions {
		tag := core.NewRecord(tags)
		tag.Id = instruction.Id
		tag.Set("type", safetyTagType)
		tag.Set("slug", instruction.GetString("slug"))
		tag.Set("name", instruction.GetString("name"))
		tag.Set("description", instruction.GetString("description"))
		if err := app.Save(tag); err != nil {
			return fmt.Errorf("safety instruction %s: %w", instruction.Id, err)
		}
	}

	if err := moveRelation(app, activitiesCollection, safetyInstructionsCollection, safetyTagsField, tags.Id); err != nil {
		return err
	}

	collection, err := app.FindCollectionByNameOrId(safetyInstructionsCollection)
	if err != nil {
		return err
	}

	return app.Delete(collection)
}

// moveRelation replaces the multi-relation `from` on `holder` by `to`, pointing at `target`, and
// carries each record's links over. The target holds the same ids as the one it replaces.
func moveRelation(app core.App, holder string, from string, to string, target string) error {
	collection, err := app.FindCollectionByNameOrId(holder)
	if err != nil {
		return err
	}

	records, err := app.FindAllRecords(collection)
	if err != nil {
		return err
	}
	links := make(map[string][]string, len(records))
	for _, record := range records {
		links[record.Id] = record.GetStringSlice(from)
	}

	// A relation's target cannot change in place: the field goes, and a new one takes its place.
	position := fieldPosition(collection, from)
	collection.Fields.RemoveByName(from)
	collection.Fields.AddAt(position, &core.RelationField{Name: to, CollectionId: target, MaxSelect: 999})
	if err := app.Save(collection); err != nil {
		return err
	}

	for id, ids := range links {
		if len(ids) == 0 {
			continue
		}

		record, err := app.FindRecordById(collection, id)
		if err != nil {
			return err
		}
		record.Set(to, ids)

		// Without validation, as in the tags merge: an older draft breaking an unrelated rule
		// must not block the move.
		if err := app.SaveNoValidate(record); err != nil {
			return fmt.Errorf("%s %s: %w", holder, id, err)
		}
	}

	return nil
}
