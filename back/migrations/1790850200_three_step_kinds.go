package migrations

import (
	"fmt"
	"slices"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// A step's `kind` comes down to the three the app treats apart: PREPARE, which the timing counts
// as preparation and the run puts before gathering the children; CONCLUSION; and CUSTOM, a step
// the author writes freely. Explaining, forming teams, starting and announcing the end become
// CUSTOM, and their title still says what they are.
//
// `end_criteria` and `end_criteria_other` were only shown on ANNOUNCE_END. The columns stay, with
// what they hold; the front no longer reads them.
//
// The rollback offers the seven kinds again, but every step it made CUSTOM stays CUSTOM: which
// kind it was is not something the data says any more.
func init() {
	m.Register(func(app core.App) error {
		steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
		if err != nil {
			return err
		}

		records, err := app.FindRecordsByFilter(
			steps,
			"kind != {:prepare} && kind != {:custom} && kind != {:conclusion}",
			"", 0, 0,
			dbx.Params{"prepare": "PREPARE", "custom": "CUSTOM", "conclusion": "CONCLUSION"},
		)
		if err != nil {
			return err
		}
		// Without validation: an older step breaking an unrelated rule must not block the move.
		for _, step := range records {
			step.Set("kind", "CUSTOM")
			if err := app.SaveNoValidate(step); err != nil {
				return fmt.Errorf("step %s: %w", step.Id, err)
			}
		}

		steps.Fields.GetByName("kind").(*core.SelectField).Values = slices.Clone(stepKindsAfter)
		return app.Save(steps)
	}, func(app core.App) error {
		steps, err := app.FindCollectionByNameOrId(activityStepsCollection)
		if err != nil {
			return err
		}

		steps.Fields.GetByName("kind").(*core.SelectField).Values = slices.Clone(stepKindsBefore)
		return app.Save(steps)
	})
}

var (
	stepKindsBefore = []string{"PREPARE", "EXPLAIN", "TEAMS", "LAUNCH", "CUSTOM", "ANNOUNCE_END", "CONCLUSION"}
	stepKindsAfter  = []string{"PREPARE", "CUSTOM", "CONCLUSION"}
)
