package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// `user_planned_activities` holds when a user means to run an activity: the planning's calendar.
// An activity may be planned any number of times, so there is no unique index on the pair.
// Each user reads and writes their own, and nobody else's.
func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		planned := core.NewBaseCollection("user_planned_activities")

		ownRule := "user = @request.auth.id"
		createRule := "@request.body.user = @request.auth.id"
		updateRule := ownRule + " && @request.body.user:changed = false"
		planned.ListRule, planned.ViewRule = &ownRule, &ownRule
		planned.CreateRule, planned.UpdateRule, planned.DeleteRule = &createRule, &updateRule, &ownRule

		planned.Fields.Add(
			&core.RelationField{Name: "user", CollectionId: "_pb_users_auth_", MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.RelationField{Name: "activity", CollectionId: activities.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.DateField{Name: "start", Required: true},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		// The calendar reads one user's planning over a range of dates.
		planned.AddIndex("idx_user_planned_activities_user_start", false, "`user`, `start`", "")

		return app.Save(planned)
	}, func(app core.App) error {
		planned, err := app.FindCollectionByNameOrId("user_planned_activities")
		if err != nil {
			return err
		}
		return app.Delete(planned)
	})
}
