package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Users get a `role`, read by the client to hide screens and guard their routes. Empty means a
// plain user, so every existing account stays one.
//
// A user may sign up and update their own record, so both rules now refuse a body that sets
// `role`: otherwise anyone could make themselves an admin. Granting a role is a superuser's job,
// from the Dashboard.
func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		users.Fields.Add(&core.SelectField{
			Name:      "role",
			MaxSelect: 1,
			Values:    []string{"USER", "ADMIN"},
		})
		users.CreateRule = pointer("@request.body.role:isset = false")
		users.UpdateRule = pointer("id = @request.auth.id && @request.body.role:isset = false")

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		users.Fields.RemoveByName("role")
		users.CreateRule = pointer("")
		users.UpdateRule = pointer("id = @request.auth.id")

		return app.Save(users)
	})
}
