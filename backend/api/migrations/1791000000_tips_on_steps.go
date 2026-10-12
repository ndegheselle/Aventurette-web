package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Tips move from the activity to its steps: a step links the tips of the catalogue that help
// run it, through `activities_steps.tips`, and `activities.tips` goes.
//
// Which step a tip was for is not something the data says, so every tip an activity linked goes
// on its first step. An activity with no step has nowhere to keep them: they stay in the
// catalogue.
//
// The rollback gives an activity every tip its steps link, each once.
func init() {
	m.Register(tipsOnSteps, tipsOnActivities)
}

const catalogTipsCollection = "catalog_tips"

func tipsOnSteps(app core.App) error {
	tips, err := app.FindCollectionByNameOrId(catalogTipsCollection)
	if err != nil {
		return err
	}
	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}
	steps.Fields.Add(&core.RelationField{Name: tipsField, CollectionId: tips.Id, MaxSelect: 999})
	if err := app.Save(steps); err != nil {
		return err
	}

	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}
	records, err := app.FindAllRecords(activities)
	if err != nil {
		return err
	}

	for _, activity := range records {
		linked := activity.GetStringSlice(tipsField)
		if len(linked) == 0 {
			continue
		}

		ordered, err := stepsInOrder(app, activity)
		if err != nil {
			return err
		}
		if len(ordered) == 0 {
			continue
		}

		first := ordered[0]
		first.Set(tipsField, linked)
		if err := app.SaveNoValidate(first); err != nil {
			return fmt.Errorf("step %s: %w", first.Id, err)
		}
	}

	activities.Fields.RemoveByName(tipsField)

	return app.Save(activities)
}

func tipsOnActivities(app core.App) error {
	tips, err := app.FindCollectionByNameOrId(catalogTipsCollection)
	if err != nil {
		return err
	}
	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}
	activities.Fields.Add(&core.RelationField{Name: tipsField, CollectionId: tips.Id, MaxSelect: 999})
	if err := app.Save(activities); err != nil {
		return err
	}

	records, err := app.FindAllRecords(activities)
	if err != nil {
		return err
	}

	for _, activity := range records {
		ordered, err := stepsInOrder(app, activity)
		if err != nil {
			return err
		}

		var given []string
		seen := map[string]bool{}
		for _, step := range ordered {
			for _, id := range step.GetStringSlice(tipsField) {
				if !seen[id] {
					seen[id] = true
					given = append(given, id)
				}
			}
		}
		if len(given) == 0 {
			continue
		}

		activity.Set(tipsField, given)
		if err := app.SaveNoValidate(activity); err != nil {
			return fmt.Errorf("activity %s: %w", activity.Id, err)
		}
	}

	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}
	steps.Fields.RemoveByName(tipsField)

	return app.Save(steps)
}
