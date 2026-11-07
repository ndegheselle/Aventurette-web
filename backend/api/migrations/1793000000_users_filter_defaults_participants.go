package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The filter defaults ask for the number of children rather than a duration: the duration bounds
// go, and the participants bounds come in their place. They are not renamed, as minutes do not
// read as children: whoever had chosen a duration starts again from no default.
func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		users.Fields.RemoveByName("defaultDurationMin")
		users.Fields.RemoveByName("defaultDurationMax")
		users.Fields.Add(
			&core.NumberField{Name: "defaultParticipantsMin", OnlyInt: true},
			&core.NumberField{Name: "defaultParticipantsMax", OnlyInt: true},
		)

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		users.Fields.RemoveByName("defaultParticipantsMin")
		users.Fields.RemoveByName("defaultParticipantsMax")
		users.Fields.Add(
			&core.NumberField{Name: "defaultDurationMin", OnlyInt: true},
			&core.NumberField{Name: "defaultDurationMax", OnlyInt: true},
		)

		return app.Save(users)
	})
}
