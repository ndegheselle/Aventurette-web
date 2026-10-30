package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// `activities.duration`: how long the activity takes, in minutes, as the sum of its steps'. The
// catalogue filters on it. A hook keeps it in step from then on (`hooks/activity_duration.go`);
// this fills it for the activities that exist already.
func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		activities.Fields.Add(&core.NumberField{Name: "duration", OnlyInt: true})
		if err := app.Save(activities); err != nil {
			return err
		}

		_, err = app.DB().NewQuery(
			"UPDATE activities SET duration = " +
				"(SELECT COALESCE(SUM(duration), 0) FROM activities_steps WHERE activity = activities.id)",
		).Execute()
		return err
	}, func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		activities.Fields.RemoveByName("duration")
		return app.Save(activities)
	})
}
