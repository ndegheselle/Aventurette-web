package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// An admin reading the comments on an activity sees who wrote each one: expanding a feedback's
// `user` goes through the users' view rule, which only let a user see themselves. Viewing only —
// the list rule stays as it was, so an admin still cannot enumerate the users. The email stays
// hidden unless the user made it visible.
func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		viewRule := "id = @request.auth.id || " + adminWriteRule
		users.ViewRule = &viewRule
		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		viewRule := "id = @request.auth.id"
		users.ViewRule = &viewRule
		return app.Save(users)
	})
}
