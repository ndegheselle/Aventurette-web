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

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
			"hidden": false,
			"id": "select435178374",
			"maxSelect": 1,
			"name": "environment",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": [
				"INDOOR",
				"OUTDOOR",
				"CLASSROOM",
				"CAR"
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

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
			"hidden": false,
			"id": "select435178374",
			"maxSelect": 1,
			"name": "environment",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": [
				"INDOOR",
				"OUTDOOR",
				"CLASSROOM",
				"CAR"
			]
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
