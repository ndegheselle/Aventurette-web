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
		if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select2744374011",
			"maxSelect": 0,
			"name": "state",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": [
				"DRAFT",
				"VALIDATED"
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
		collection.Fields.RemoveById("select2744374011")

		return app.Save(collection)
	})
}
