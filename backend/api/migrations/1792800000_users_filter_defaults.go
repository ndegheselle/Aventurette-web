package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The catalogue's filter defaults, on the user record: the ages, the duration in minutes and the
// places they look for activities in, chosen at onboarding or in the profile. A 0 in a bound is
// unset, as on an activity's audience. `onboarded` says the onboarding was shown, saved or not.
// The `users` rules already keep the record to its owner.
func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		// The places are copied from an activity's, as they stand when this runs.
		locations := activities.Fields.GetByName("locations").(*core.SelectField)

		users.Fields.Add(
			&core.NumberField{Name: "defaultAgeMin", OnlyInt: true},
			&core.NumberField{Name: "defaultAgeMax", OnlyInt: true},
			&core.NumberField{Name: "defaultDurationMin", OnlyInt: true},
			&core.NumberField{Name: "defaultDurationMax", OnlyInt: true},
			&core.SelectField{Name: "defaultLocations", Values: locations.Values, MaxSelect: len(locations.Values)},
			&core.BoolField{Name: "onboarded"},
		)

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		for _, name := range []string{"defaultAgeMin", "defaultAgeMax", "defaultDurationMin", "defaultDurationMax", "defaultLocations", "onboarded"} {
			users.Fields.RemoveByName(name)
		}

		return app.Save(users)
	})
}
