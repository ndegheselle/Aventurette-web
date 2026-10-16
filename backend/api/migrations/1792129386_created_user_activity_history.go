package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		jsonData := `{
			"createRule": "user = @request.auth.id",
			"deleteRule": "user = @request.auth.id",
			"fields": [
				{
					"autogeneratePattern": "[a-z0-9]{15}",
					"help": "",
					"hidden": false,
					"id": "text3208210256",
					"max": 15,
					"min": 15,
					"name": "id",
					"pattern": "^[a-z0-9]+$",
					"presentable": false,
					"primaryKey": true,
					"required": true,
					"system": true,
					"type": "text"
				},
				{
					"cascadeDelete": true,
					"collectionId": "_pb_users_auth_",
					"help": "",
					"hidden": false,
					"id": "relation2375276105",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "user",
					"presentable": false,
					"required": true,
					"system": false,
					"type": "relation"
				},
				{
					"cascadeDelete": true,
					"collectionId": "pbc_1262591861",
					"help": "",
					"hidden": false,
					"id": "relation2893285722",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "activity",
					"presentable": false,
					"required": true,
					"system": false,
					"type": "relation"
				},
				{
					"hidden": false,
					"id": "autodate2990389176",
					"name": "created",
					"onCreate": true,
					"onUpdate": false,
					"presentable": false,
					"system": false,
					"type": "autodate"
				},
				{
					"hidden": false,
					"id": "autodate3332085495",
					"name": "updated",
					"onCreate": true,
					"onUpdate": true,
					"presentable": false,
					"system": false,
					"type": "autodate"
				}
			],
			"id": "pbc_1235022335",
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_user_activity_history_user_activity` + "`" + ` ON ` + "`" + `user_activity_history` + "`" + ` (` + "`" + `user` + "`" + `, ` + "`" + `activity` + "`" + `)"
			],
			"listRule": "user = @request.auth.id",
			"name": "user_activity_history",
			"system": false,
			"type": "base",
			"updateRule": "user = @request.auth.id && @request.body.user:changed = false && @request.body.activity:changed = false",
			"viewRule": "user = @request.auth.id"
		}`

		collection := &core.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1235022335")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
