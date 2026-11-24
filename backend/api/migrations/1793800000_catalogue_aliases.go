package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Tags, safety instructions and tips gain `aliases`: the other names a glossary gives one entry,
// separated by semicolons. The import matches a fiche's wording on them as on the name, so
// « coopérer » links *Coopération* rather than creating a second tag. The rollback drops them.
var aliasedCatalogues = []string{"catalog_tags", "catalog_safety_instructions", "catalog_tips"}

func init() {
	m.Register(func(app core.App) error {
		for _, name := range aliasedCatalogues {
			collection, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				return err
			}
			collection.Fields.Add(&core.TextField{Name: "aliases", Max: 1000})
			if err := app.Save(collection); err != nil {
				return err
			}
		}
		return nil
	}, func(app core.App) error {
		for _, name := range aliasedCatalogues {
			collection, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				return err
			}
			collection.Fields.RemoveByName("aliases")
			if err := app.Save(collection); err != nil {
				return err
			}
		}
		return nil
	})
}
