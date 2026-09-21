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
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select2731739681",
			"maxSelect": 0,
			"name": "environnement",
			"presentable": false,
			"required": true,
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

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(8, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number970622150",
			"max": null,
			"min": null,
			"name": "age_min",
			"onlyInt": false,
			"presentable": false,
			"required": true,
			"system": false,
			"type": "number"
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(9, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number98024351",
			"max": null,
			"min": null,
			"name": "age_max",
			"onlyInt": false,
			"presentable": false,
			"required": true,
			"system": false,
			"type": "number"
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number1016452113",
			"max": null,
			"min": null,
			"name": "participants_min",
			"onlyInt": false,
			"presentable": false,
			"required": true,
			"system": false,
			"type": "number"
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
			"help": "",
			"hidden": false,
			"id": "number10021704",
			"max": null,
			"min": null,
			"name": "participants_max",
			"onlyInt": false,
			"presentable": false,
			"required": true,
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

		// update field
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

		// update field
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

		// update field
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

		// update field
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

		// update field
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

		return app.Save(collection)
	})
}
