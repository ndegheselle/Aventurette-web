package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1390496223")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "user.id = @request.auth.id",
			"deleteRule": "user.id = @request.auth.id",
			"listRule": "user.id = @request.auth.id",
			"updateRule": "user.id = @request.auth.id",
			"viewRule": "user.id = @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"cascadeDelete": false,
			"collectionId": "_pb_users_auth_",
			"hidden": false,
			"id": "relation2375276105",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "user",
			"presentable": false,
			"required": true,
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

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "families_via_childrens.user.id = @request.auth.id",
			"deleteRule": "families_via_childrens.user.id = @request.auth.id",
			"listRule": "families_via_childrens.user.id = @request.auth.id",
			"updateRule": "families_via_childrens.user.id = @request.auth.id",
			"viewRule": "families_via_childrens.user.id = @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation2375276105")

		return app.Save(collection)
	})
}
