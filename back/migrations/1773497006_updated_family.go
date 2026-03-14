package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2465553429")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_1390496223",
			"hidden": false,
			"id": "relation807076392",
			"maxSelect": 999,
			"minSelect": 0,
			"name": "childrens",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2465553429")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation807076392")

		return app.Save(collection)
	})
}
