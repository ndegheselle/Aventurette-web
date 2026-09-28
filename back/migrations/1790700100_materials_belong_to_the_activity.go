package migrations

import (
	"fmt"
	"slices"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The material list moves from each step to the activity, as the activity sheet template has it:
// one list of everything the activity needs, each with a quantity, that a step recalls the
// items it uses from.
//
// `steps_materials` held a row per step, so a rope used in two steps was two rows. They become
// one `activities_materials` row per distinct name in the activity — told apart case-insensitively,
// first spelling kept — and each step links the rows it used to have.
//
// A step's link does not cascade any more: deleting a material only drops it from the steps and
// workshops that recall it.
func init() {
	m.Register(moveMaterialsToActivity, moveMaterialsToSteps)
}

const (
	activityMaterialsCollection = "activities_materials"
	stepMaterialsCollection     = "steps_materials"
	activityStepsCollection     = "activities_steps"
)

// Ids from the snapshot, so a rollback restores `steps_materials` as it was.
const (
	stepMaterialsCollectionId = "pbc_1895602027"
	stepMaterialsFieldId      = "relation2601981621"
	stepMaterialsStepFieldId  = "relation1136262716"
	stepMaterialsNameFieldId  = "text1579384326"
)

func moveMaterialsToActivity(app core.App) error {
	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}

	materials := core.NewBaseCollection(activityMaterialsCollection)
	openToEveryone(materials)
	materials.Fields.Add(
		&core.RelationField{Name: "activity", CollectionId: activities.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
		&core.TextField{Name: "name", Required: true},
		// Free text rather than a number: "one per child" is a quantity too.
		&core.TextField{Name: "quantity"},
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
	if err := app.Save(materials); err != nil {
		return err
	}

	activities.Fields.Add(&core.RelationField{Name: "materials", CollectionId: materials.Id, MaxSelect: 999})
	if err := app.Save(activities); err != nil {
		return err
	}

	namesByStep, err := stepMaterialNames(app)
	if err != nil {
		return err
	}

	activityRecords, err := app.FindAllRecords(activities)
	if err != nil {
		return err
	}

	// What each step will link, once its old field is gone and the new one is in.
	linksByStep := map[string][]string{}

	for _, activity := range activityRecords {
		steps, err := stepsInOrder(app, activity)
		if err != nil {
			return err
		}

		idsByName := map[string]string{}
		var activityMaterials []string

		for _, step := range steps {
			var stepMaterials []string
			for _, name := range namesByStep[step.Id] {
				key := strings.ToLower(strings.TrimSpace(name))
				id, known := idsByName[key]
				if !known {
					material := core.NewRecord(materials)
					material.Set("activity", activity.Id)
					material.Set("name", strings.TrimSpace(name))
					if err := app.Save(material); err != nil {
						return fmt.Errorf("activity %s, material %q: %w", activity.Id, name, err)
					}

					id = material.Id
					idsByName[key] = id
					activityMaterials = append(activityMaterials, id)
				}
				if !slices.Contains(stepMaterials, id) {
					stepMaterials = append(stepMaterials, id)
				}
			}
			linksByStep[step.Id] = stepMaterials
		}

		activity.Set("materials", activityMaterials)
		if err := app.SaveNoValidate(activity); err != nil {
			return fmt.Errorf("activity %s: %w", activity.Id, err)
		}
	}

	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}

	// The relation's target cannot change in place, so the field is dropped and added anew.
	steps.Fields.RemoveByName("materials")
	if err := app.Save(steps); err != nil {
		return err
	}
	steps.Fields.Add(&core.RelationField{Name: "materials", CollectionId: materials.Id, MaxSelect: 999})
	if err := app.Save(steps); err != nil {
		return err
	}

	for stepId, links := range linksByStep {
		step, err := app.FindRecordById(steps, stepId)
		if err != nil {
			return err
		}
		step.Set("materials", links)
		if err := app.SaveNoValidate(step); err != nil {
			return fmt.Errorf("step %s: %w", stepId, err)
		}
	}

	old, err := app.FindCollectionByNameOrId(stepMaterialsCollection)
	if err != nil {
		return err
	}

	return app.Delete(old)
}

func moveMaterialsToSteps(app core.App) error {
	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}

	stepRecords, err := app.FindAllRecords(steps)
	if err != nil {
		return err
	}

	namesByStep := map[string][]string{}
	for _, step := range stepRecords {
		for _, id := range step.GetStringSlice("materials") {
			material, err := app.FindRecordById(activityMaterialsCollection, id)
			if err != nil {
				continue // a dangling id: nothing to carry back
			}
			namesByStep[step.Id] = append(namesByStep[step.Id], material.GetString("name"))
		}
	}

	old := core.NewBaseCollection(stepMaterialsCollection, stepMaterialsCollectionId)
	openToEveryone(old)
	old.Fields.Add(
		&core.RelationField{Id: stepMaterialsStepFieldId, Name: "step", CollectionId: steps.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
		&core.TextField{Id: stepMaterialsNameFieldId, Name: "name", Required: true},
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
	if err := app.Save(old); err != nil {
		return err
	}

	steps.Fields.RemoveByName("materials")
	if err := app.Save(steps); err != nil {
		return err
	}
	steps.Fields.Add(&core.RelationField{Id: stepMaterialsFieldId, Name: "materials", CollectionId: old.Id, MaxSelect: 999, CascadeDelete: true})
	if err := app.Save(steps); err != nil {
		return err
	}

	for stepId, names := range namesByStep {
		step, err := app.FindRecordById(steps, stepId)
		if err != nil {
			return err
		}

		var links []string
		for _, name := range names {
			material := core.NewRecord(old)
			material.Set("step", stepId)
			material.Set("name", name)
			if err := app.Save(material); err != nil {
				return err
			}
			links = append(links, material.Id)
		}

		step.Set("materials", links)
		if err := app.SaveNoValidate(step); err != nil {
			return fmt.Errorf("step %s: %w", stepId, err)
		}
	}

	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}
	activities.Fields.RemoveByName("materials")
	if err := app.Save(activities); err != nil {
		return err
	}

	materials, err := app.FindCollectionByNameOrId(activityMaterialsCollection)
	if err != nil {
		return err
	}

	return app.Delete(materials)
}

// stepMaterialNames reads, for each step, the names of the materials it links, in link order.
func stepMaterialNames(app core.App) (map[string][]string, error) {
	steps, err := app.FindAllRecords(activityStepsCollection)
	if err != nil {
		return nil, err
	}

	names := map[string][]string{}
	for _, step := range steps {
		for _, id := range step.GetStringSlice("materials") {
			material, err := app.FindRecordById(stepMaterialsCollection, id)
			if err != nil {
				continue // a dangling id: nothing to carry over
			}
			names[step.Id] = append(names[step.Id], material.GetString("name"))
		}
	}

	return names, nil
}

// stepsInOrder is an activity's steps as the activity lists them, then any step pointing at the
// activity that the list has lost — its materials are the activity's all the same.
func stepsInOrder(app core.App, activity *core.Record) ([]*core.Record, error) {
	listed := activity.GetStringSlice("steps")

	owned, err := app.FindAllRecords(activityStepsCollection)
	if err != nil {
		return nil, err
	}

	byId := map[string]*core.Record{}
	for _, step := range owned {
		if step.GetString("activity") == activity.Id {
			byId[step.Id] = step
		}
	}

	ordered := make([]*core.Record, 0, len(byId))
	for _, id := range listed {
		if step, ok := byId[id]; ok {
			ordered = append(ordered, step)
			delete(byId, id)
		}
	}
	for _, step := range owned {
		if _, left := byId[step.Id]; left {
			ordered = append(ordered, step)
		}
	}

	return ordered, nil
}

// openToEveryone gives a collection the rules the step collections have: anyone may read and
// write it.
func openToEveryone(collection *core.Collection) {
	for _, rule := range []**string{&collection.ListRule, &collection.ViewRule, &collection.CreateRule, &collection.UpdateRule, &collection.DeleteRule} {
		*rule = pointer("")
	}
}

