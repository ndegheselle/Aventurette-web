package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The rest of the activity sheet template:
//   - `activities_workshops`, the stations an activity runs in parallel, each with the adults it
//     takes to hold it. An activity lists its own in `workshops`.
//   - on a step, what guiding it needs: a title, its kind, an estimated duration, the brief of
//     its one visual, the actions to tick, a tip, and for the step announcing the end, the
//     criteria for ending.
//
// Every step there already is becomes CUSTOM: which of the template's steps it was is not
// something the data says.
func init() {
	m.Register(addWorkshopsAndStepGuidance, removeWorkshopsAndStepGuidance)
}

const workshopsCollection = "activities_workshops"

var stepGuidanceFields = []string{"title", "kind", "duration", "visual_brief", "actions", "tip", "end_criteria", "end_criteria_other"}

func addWorkshopsAndStepGuidance(app core.App) error {
	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}
	materials, err := app.FindCollectionByNameOrId(activityMaterialsCollection)
	if err != nil {
		return err
	}

	workshops := core.NewBaseCollection(workshopsCollection)
	openToEveryone(workshops)
	workshops.Fields.Add(
		&core.RelationField{Name: "activity", CollectionId: activities.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
		&core.TextField{Name: "name", Required: true},
		&core.TextField{Name: "theme"},
		&core.EditorField{Name: "challenges"},
		&core.RelationField{Name: "materials", CollectionId: materials.Id, MaxSelect: 999},
		&core.NumberField{Name: "adults_required", OnlyInt: true, Min: floatPointer(0)},
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
	if err := app.Save(workshops); err != nil {
		return err
	}

	activities.Fields.Add(&core.RelationField{Name: "workshops", CollectionId: workshops.Id, MaxSelect: 999})
	if err := app.Save(activities); err != nil {
		return err
	}

	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}

	steps.Fields.Add(
		&core.TextField{Name: "title"},
		&core.SelectField{Name: "kind", MaxSelect: 1, Values: []string{"PREPARE", "EXPLAIN", "TEAMS", "LAUNCH", "CUSTOM", "ANNOUNCE_END", "CONCLUSION"}},
		&core.NumberField{Name: "duration", OnlyInt: true, Min: floatPointer(0)},
		&core.TextField{Name: "visual_brief"},
		&core.JSONField{Name: "actions"},
		&core.EditorField{Name: "tip"},
		&core.SelectField{Name: "end_criteria", MaxSelect: 4, Values: []string{"TIME_UP", "ENOUGH_DONE", "ATTENTION_DROPS", "TEAM_WON"}},
		&core.TextField{Name: "end_criteria_other"},
	)
	if err := app.Save(steps); err != nil {
		return err
	}

	records, err := app.FindAllRecords(steps)
	if err != nil {
		return err
	}
	for _, step := range records {
		step.Set("kind", "CUSTOM")
		if err := app.SaveNoValidate(step); err != nil {
			return fmt.Errorf("step %s: %w", step.Id, err)
		}
	}

	// Required once every row has one.
	steps.Fields.GetByName("kind").(*core.SelectField).Required = true
	return app.Save(steps)
}

func removeWorkshopsAndStepGuidance(app core.App) error {
	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}
	for _, name := range stepGuidanceFields {
		steps.Fields.RemoveByName(name)
	}
	if err := app.Save(steps); err != nil {
		return err
	}

	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}
	activities.Fields.RemoveByName("workshops")
	if err := app.Save(activities); err != nil {
		return err
	}

	workshops, err := app.FindCollectionByNameOrId(workshopsCollection)
	if err != nil {
		return err
	}

	return app.Delete(workshops)
}

func floatPointer(value float64) *float64 {
	return &value
}
