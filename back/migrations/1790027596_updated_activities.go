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
		if err := collection.Fields.AddMarshaledJSONAt(20, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_4254783606",
			"help": "",
			"hidden": false,
			"id": "relation3823845521",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "develop_social",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
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
		if err := collection.Fields.AddMarshaledJSONAt(20, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_4254783606",
			"help": "",
			"hidden": false,
			"id": "relation3823845521",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "develop_emotional",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
