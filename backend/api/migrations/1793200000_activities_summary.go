package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// `activities.summary`: a few plain sentences presenting the activity, shown under its title.
// Capped at 300 characters so it stays a pitch; the description holds the rest.
func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		activities.Fields.Add(&core.TextField{Name: "summary", Max: 300})
		return app.Save(activities)
	}, func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		activities.Fields.RemoveByName("summary")
		return app.Save(activities)
	})
}
