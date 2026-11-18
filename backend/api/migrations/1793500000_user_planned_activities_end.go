package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// A planned activity stores when it ends. Its length is set once, when the activity is planned,
// and kept: editing the activity's steps no longer moves the plannings holding it.
//
// The records already there end where they were shown to: after the activity's play steps (every
// step but those preparing the game), or 30 minutes after their start when those add up to
// nothing, a day at most.
//
// The rollback drops the field: the length is read from the steps again.
const backfillPlannedEndQuery = `UPDATE user_planned_activities SET "end" = strftime('%Y-%m-%d %H:%M:%fZ', start, '+' || MIN(1440, COALESCE(NULLIF(
	(SELECT COALESCE(SUM(duration), 0) FROM activities_steps WHERE activity = user_planned_activities.activity AND kind != 'PREPARE'),
	0), 30)) || ' minutes')
WHERE "end" = '' OR "end" IS NULL`

func init() {
	m.Register(func(app core.App) error {
		planned, err := app.FindCollectionByNameOrId("user_planned_activities")
		if err != nil {
			return err
		}

		planned.Fields.Add(&core.DateField{Name: "end", Required: true})
		if err := app.Save(planned); err != nil {
			return err
		}

		_, err = app.DB().NewQuery(backfillPlannedEndQuery).Execute()
		return err
	}, func(app core.App) error {
		planned, err := app.FindCollectionByNameOrId("user_planned_activities")
		if err != nil {
			return err
		}

		planned.Fields.RemoveByName("end")
		return app.Save(planned)
	})
}
