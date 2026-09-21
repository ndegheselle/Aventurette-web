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
		if err := collection.Fields.AddMarshaledJSONAt(13, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select4041497513",
			"maxSelect": 0,
			"name": "season",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "select",
			"values": [
				"AUTUMN",
				"WINTER",
				"SPRING",
				"SUMMER",
				"CHRISTMAS",
				"NEW YEAR",
				"HALLOWEEN",
				"EASTER",
				"VALENTINE"
			]
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(14, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select1288754030",
			"maxSelect": 0,
			"name": "weather",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "select",
			"values": [
				"RAIN",
				"SNOW",
				"SUNNY",
				"WINDY"
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
		collection.Fields.RemoveById("select4041497513")

		// remove field
		collection.Fields.RemoveById("select1288754030")

		return app.Save(collection)
	})
}
