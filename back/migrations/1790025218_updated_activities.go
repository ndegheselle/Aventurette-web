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
			"cascadeDelete": false,
			"collectionId": "pbc_539767812",
			"help": "",
			"hidden": false,
			"id": "relation3315324353",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "security",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(17, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_4231066068",
			"help": "",
			"hidden": false,
			"id": "relation2128995208",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "fields",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(18, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_3168962977",
			"help": "",
			"hidden": false,
			"id": "relation1460209791",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "imaginary",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(19, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_932243895",
			"help": "",
			"hidden": false,
			"id": "relation270393044",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "develop_affect",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
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

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(21, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_2556553961",
			"help": "",
			"hidden": false,
			"id": "relation2857790826",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "develop_intellectual",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(22, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_870588848",
			"help": "",
			"hidden": false,
			"id": "relation2680852346",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "develop_moral",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(23, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_112511032",
			"help": "",
			"hidden": false,
			"id": "relation1994278826",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "develop_physical",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(24, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_3877408095",
			"help": "",
			"hidden": false,
			"id": "relation1445969280",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "develop_spritual",
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

		// remove field
		collection.Fields.RemoveById("relation3315324353")

		// remove field
		collection.Fields.RemoveById("relation2128995208")

		// remove field
		collection.Fields.RemoveById("relation1460209791")

		// remove field
		collection.Fields.RemoveById("relation270393044")

		// remove field
		collection.Fields.RemoveById("relation3823845521")

		// remove field
		collection.Fields.RemoveById("relation2857790826")

		// remove field
		collection.Fields.RemoveById("relation2680852346")

		// remove field
		collection.Fields.RemoveById("relation1994278826")

		// remove field
		collection.Fields.RemoveById("relation1445969280")

		return app.Save(collection)
	})
}
