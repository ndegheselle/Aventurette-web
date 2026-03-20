package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1390496223")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_2896159602",
			"hidden": false,
			"id": "relation3367241194",
			"maxSelect": 999,
			"minSelect": 0,
			"name": "interests",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1390496223")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation3367241194")

		return app.Save(collection)
	})
}
