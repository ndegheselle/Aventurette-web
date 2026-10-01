package migrations

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// A tip leaves the step for a catalogue shared by every activity, `tips`, the way safety
// instructions are one: a name and the advice itself. An activity links the tips it gives
// through `activities.tips`. Like the other catalogues of reference data, anyone may read it and
// a superuser writes it.
//
// Each step holding a tip gives the catalogue one row, linked to the step's activity in the
// order of its steps. The row is named after the step, or after the activity when the step has
// no title. Nothing is deduplicated: two tips worded alike were still written for two steps.
//
// The rollback puts every tip an activity links back on its first step, one after the other:
// which step a tip came from is not something the data says any more.
func init() {
	m.Register(tipsBecomeACatalogue, tipsBackOnSteps)
}

const (
	tipsCollection = "tips"
	tipsField      = "tips"
	stepTipField   = "tip"
)

func tipsBecomeACatalogue(app core.App) error {
	tips := core.NewBaseCollection(tipsCollection)
	tips.ListRule = pointer("")
	tips.ViewRule = pointer("")
	tips.Fields.Add(
		&core.TextField{Name: "name", Required: true},
		&core.EditorField{Name: "description"},
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
	if err := app.Save(tips); err != nil {
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
		steps, err := stepsInOrder(app, activity)
		if err != nil {
			return err
		}

		var linked []string
		for _, step := range steps {
			advice := step.GetString(stepTipField)
			if isBlankHtml(advice) {
				continue
			}

			name := strings.TrimSpace(step.GetString("title"))
			if name == "" {
				name = activity.GetString("name")
			}

			tip := core.NewRecord(tips)
			tip.Set("name", name)
			tip.Set("description", advice)
			if err := app.Save(tip); err != nil {
				return fmt.Errorf("tip of step %s: %w", step.Id, err)
			}
			linked = append(linked, tip.Id)
		}

		if len(linked) == 0 {
			continue
		}

		activity.Set(tipsField, linked)
		if err := app.SaveNoValidate(activity); err != nil {
			return fmt.Errorf("activity %s: %w", activity.Id, err)
		}
	}

	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}
	steps.Fields.RemoveByName(stepTipField)

	return app.Save(steps)
}

func tipsBackOnSteps(app core.App) error {
	steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
	if err != nil {
		return err
	}
	steps.Fields.AddAt(fieldPosition(steps, "actions")+1, &core.EditorField{Name: stepTipField})
	if err := app.Save(steps); err != nil {
		return err
	}

	tips, err := app.FindAllRecords(tipsCollection)
	if err != nil {
		return err
	}
	advice := make(map[string]string, len(tips))
	for _, tip := range tips {
		advice[tip.Id] = tip.GetString("description")
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
		var given []string
		for _, id := range activity.GetStringSlice(tipsField) {
			if text, ok := advice[id]; ok && !isBlankHtml(text) {
				given = append(given, text)
			}
		}
		if len(given) == 0 {
			continue
		}

		ordered, err := stepsInOrder(app, activity)
		if err != nil {
			return err
		}
		if len(ordered) == 0 {
			continue // no step to carry them: they go with the catalogue
		}

		first := ordered[0]
		first.Set(stepTipField, strings.Join(given, ""))
		if err := app.SaveNoValidate(first); err != nil {
			return fmt.Errorf("step %s: %w", first.Id, err)
		}
	}

	activities.Fields.RemoveByName(tipsField)
	if err := app.Save(activities); err != nil {
		return err
	}

	collection, err := app.FindCollectionByNameOrId(tipsCollection)
	if err != nil {
		return err
	}

	return app.Delete(collection)
}

var htmlTag = regexp.MustCompile(`<[^>]*>`)

// isBlankHtml says whether rich text holds no text: an editor emptied by hand leaves `<p></p>`.
func isBlankHtml(html string) bool {
	text := strings.ReplaceAll(htmlTag.ReplaceAllString(html, ""), "&nbsp;", " ")
	return strings.TrimSpace(text) == ""
}
