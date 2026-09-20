package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3346940990")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_groups_slug` + "`" + ` ON ` + "`" + `attribute_group` + "`" + ` (` + "`" + `slug` + "`" + `)"
			],
			"name": "attribute_group"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3346940990")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_groups_slug` + "`" + ` ON ` + "`" + `groups` + "`" + ` (` + "`" + `slug` + "`" + `)"
			],
			"name": "groups"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
