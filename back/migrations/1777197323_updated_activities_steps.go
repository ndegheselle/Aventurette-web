package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3921975076")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_3591639527",
			"hidden": false,
			"id": "relation2522499582",
			"maxSelect": 999,
			"minSelect": 0,
			"name": "benefits",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3921975076")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation2522499582")

		return app.Save(collection)
	})
}
