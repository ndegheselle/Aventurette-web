package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// An admin writes the tags, the safety instructions and the tips from the app's catalogue screens.
// Until now only a superuser could, from the Dashboard. Reading stays open to everyone.
//
// `catalog_materials` is left as it is: open to everyone, a gap its feature document lists.
func init() {
	m.Register(func(app core.App) error {
		return setCatalogueWriteRules(app, pointer(`@request.auth.role = "ADMIN"`))
	}, func(app core.App) error {
		return setCatalogueWriteRules(app, nil)
	})
}

var adminWrittenCatalogues = []string{"catalog_tags", "catalog_safety_instructions", "catalog_tips"}

func setCatalogueWriteRules(app core.App, rule *string) error {
	for _, name := range adminWrittenCatalogues {
		collection, err := app.FindCollectionByNameOrId(name)
		if err != nil {
			return err
		}

		collection.CreateRule = rule
		collection.UpdateRule = rule
		collection.DeleteRule = rule
		if err := app.Save(collection); err != nil {
			return err
		}
	}

	return nil
}
