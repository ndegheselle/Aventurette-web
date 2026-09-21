package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1262591861")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(15, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select584317272",
			"maxSelect": 0,
			"name": "energy_level",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "select",
			"values": [
				"LOW",
				"MEDIUM",
				"HIGH"
			]
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1262591861")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("select584317272")

		return app.Save(collection)
	})
}
