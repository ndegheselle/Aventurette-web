package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1469668780")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	}, func(app core.App) error {
		jsonData := `{
			"createRule": "",
			"deleteRule": "",
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
					"cascadeDelete": true,
					"collectionId": "pbc_3184780187",
					"help": "",
					"hidden": false,
					"id": "relation4202360827",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "attribute",
					"presentable": false,
					"required": true,
					"system": false,
					"type": "relation"
				},
				{
					"autogeneratePattern": "",
					"help": "",
					"hidden": false,
					"id": "text3380282281",
					"max": 0,
					"min": 0,
					"name": "string_value",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"help": "",
					"hidden": false,
					"id": "number2789137404",
					"max": null,
					"min": null,
					"name": "number_value",
					"onlyInt": false,
					"presentable": false,
					"required": false,
					"system": false,
					"type": "number"
				},
				{
					"help": "",
					"hidden": false,
					"id": "number1994617993",
					"max": null,
					"min": null,
					"name": "range_min",
					"onlyInt": false,
					"presentable": false,
					"required": false,
					"system": false,
					"type": "number"
				},
				{
					"help": "",
					"hidden": false,
					"id": "number1257130960",
					"max": null,
					"min": null,
					"name": "range_max",
					"onlyInt": false,
					"presentable": false,
					"required": false,
					"system": false,
					"type": "number"
				},
				{
					"cascadeDelete": false,
					"collectionId": "pbc_3328555858",
					"help": "",
					"hidden": false,
					"id": "relation1518731440",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "option",
					"presentable": false,
					"required": false,
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
			"id": "pbc_1469668780",
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_activity_attribute_values_pair` + "`" + ` ON ` + "`" + `activity_attribute_values` + "`" + ` (` + "`" + `activity` + "`" + `, ` + "`" + `attribute` + "`" + `)",
				"CREATE INDEX ` + "`" + `idx_activity_attribute_values_attribute` + "`" + ` ON ` + "`" + `activity_attribute_values` + "`" + ` (` + "`" + `attribute` + "`" + `)"
			],
			"listRule": "",
			"name": "activity_attribute_values",
			"system": false,
			"type": "base",
			"updateRule": "",
			"viewRule": ""
		}`

		collection := &core.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
