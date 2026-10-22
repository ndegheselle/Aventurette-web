package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// `user_activity_feedback` holds what a user thought of an activity once they ran it: whether
// they liked it and a comment. One per user and activity, kept up to date rather than added to.
// The user writes their own; an admin reads them all, to learn what works.
func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		feedback := core.NewBaseCollection("user_activity_feedback")

		ownRule := "user = @request.auth.id"
		readRule := ownRule + " || " + adminWriteRule
		updateRule := ownRule + " && @request.body.user:changed = false && @request.body.activity:changed = false"
		feedback.ListRule, feedback.ViewRule = &readRule, &readRule
		feedback.CreateRule, feedback.UpdateRule, feedback.DeleteRule = &ownRule, &updateRule, &ownRule

		feedback.Fields.Add(
			&core.RelationField{Name: "user", CollectionId: "_pb_users_auth_", MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.RelationField{Name: "activity", CollectionId: activities.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.BoolField{Name: "liked"},
			&core.TextField{Name: "comment", Max: 2000},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		feedback.AddIndex("idx_user_activity_feedback_user_activity", true, "`user`, `activity`", "")

		return app.Save(feedback)
	}, func(app core.App) error {
		feedback, err := app.FindCollectionByNameOrId("user_activity_feedback")
		if err != nil {
			return err
		}
		return app.Delete(feedback)
	})
}
