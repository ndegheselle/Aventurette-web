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
		if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
			"help": "",
			"hidden": false,
			"id": "file3955853343",
			"maxSelect": 0,
			"maxSize": 0,
			"mimeTypes": [],
			"name": "visual",
			"presentable": false,
			"protected": false,
			"required": false,
			"system": false,
			"thumbs": [],
			"type": "file"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select2731739681",
			"maxSelect": 0,
			"name": "environnement",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "select",
			"values": [
				"PARK",
				"HOUSE",
				"BALCONY",
				"CAR",
				"OUTDOOR",
				"CITY",
				"CAMPAIGN",
				"FOREST",
				"MOUTAIN",
				"POOL",
				"LAKE",
				"RIVER",
				"BATH",
				"MEAL"
			]
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(8, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number970622150",
			"max": null,
			"min": null,
			"name": "age_min",
			"onlyInt": false,
			"presentable": false,
			"required": false,
			"system": false,
			"type": "number"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(9, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number98024351",
			"max": null,
			"min": null,
			"name": "age_max",
			"onlyInt": false,
			"presentable": false,
			"required": false,
			"system": false,
			"type": "number"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number1016452113",
			"max": null,
			"min": null,
			"name": "participants_min",
			"onlyInt": false,
			"presentable": false,
			"required": false,
			"system": false,
			"type": "number"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number10021704",
			"max": null,
			"min": null,
			"name": "participants_max",
			"onlyInt": false,
			"presentable": false,
			"required": false,
			"system": false,
			"type": "number"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(12, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number3489587830",
			"max": null,
			"min": null,
			"name": "recommended_hosts_numbers",
			"onlyInt": false,
			"presentable": false,
			"required": false,
			"system": false,
			"type": "number"
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
		collection.Fields.RemoveById("file3955853343")

		// remove field
		collection.Fields.RemoveById("select2731739681")

		// remove field
		collection.Fields.RemoveById("number970622150")

		// remove field
		collection.Fields.RemoveById("number98024351")

		// remove field
		collection.Fields.RemoveById("number1016452113")

		// remove field
		collection.Fields.RemoveById("number10021704")

		// remove field
		collection.Fields.RemoveById("number3489587830")

		return app.Save(collection)
	})
}
