package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// A step loses `actions`, its list of actions to tick: a step is its title, its description and
// what it links. Destructive: the rollback restores the column, not what it held.
func init() {
	m.Register(func(app core.App) error {
		steps, err := app.FindCollectionByNameOrId("activities_steps")
		if err != nil {
			return err
		}
		steps.Fields.RemoveByName("actions")
		return app.Save(steps)
	}, func(app core.App) error {
		steps, err := app.FindCollectionByNameOrId("activities_steps")
		if err != nil {
			return err
		}
		steps.Fields.Add(&core.JSONField{Name: "actions"})
		return app.Save(steps)
	})
}
