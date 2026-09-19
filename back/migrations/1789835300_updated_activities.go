package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// An activity carries its groups, and stops carrying the fields the attribute catalogue now
// defines: age and duration are ranges and numbers under `Général`, environment and benefits are
// vocabularies under `Général` and the six developmental groups.
//
// The values stored in those five columns are dropped with them — nothing converts them into
// `activity_attribute_values` first.
func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}
		groups, err := app.FindCollectionByNameOrId("groups")
		if err != nil {
			return err
		}

		activities.Fields.Add(&core.RelationField{
			Name:         "groups",
			CollectionId: groups.Id,
			MaxSelect:    999,
		})

		for _, field := range []string{"ageMin", "ageMax", "durationMinutes", "environment", "benefits"} {
			activities.Fields.RemoveByName(field)
		}

		return app.Save(activities)
	}, func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		activities.Fields.RemoveByName("groups")

		// The columns as they were. What they held does not come back.
		activities.Fields.Add(
			&core.NumberField{Name: "durationMinutes"},
			&core.NumberField{Name: "ageMin"},
			&core.NumberField{Name: "ageMax"},
			&core.SelectField{
				Name:      "environment",
				Required:  true,
				MaxSelect: 1,
				Values:    []string{"INDOOR", "OUTDOOR", "CLASSROOM", "CAR"},
			},
			&core.RelationField{
				Name:         "benefits",
				CollectionId: "pbc_3591639527",
				MaxSelect:    999,
			},
		)

		return app.Save(activities)
	})
}
