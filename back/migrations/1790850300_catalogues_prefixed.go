package migrations

import (
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/dbutils"
)

// The catalogues shared by every activity take a `catalog_` prefix: `materials`, `tags`,
// `safety_instructions` and `tips`. It says the records are global reference data, written by an
// admin and picked by the activities, as `activities_` says a record belongs to one activity.
//
// The relations pointing at them hold their id, not their name, so they carry over as they are.
// The indexes named after a collection are renamed with it. The earlier migrations still use the
// old names: they run against the database as it was when they were written.
func init() {
	m.Register(func(app core.App) error {
		for _, name := range prefixedCatalogues {
			if err := renameCatalogue(app, name, catalogPrefix+name); err != nil {
				return err
			}
		}
		return nil
	}, func(app core.App) error {
		for _, name := range prefixedCatalogues {
			if err := renameCatalogue(app, catalogPrefix+name, name); err != nil {
				return err
			}
		}
		return nil
	})
}

const catalogPrefix = "catalog_"

var prefixedCatalogues = []string{materialsCollection, tagCatalogue, safetyInstructionsCollection, tipsCollection}

func renameCatalogue(app core.App, from string, to string) error {
	collection, err := app.FindCollectionByNameOrId(from)
	if err != nil {
		return err
	}

	collection.Name = to
	// PocketBase moves each index to the renamed table on save, but leaves its name.
	for i, raw := range collection.Indexes {
		index := dbutils.ParseIndex(raw)
		if suffix, ok := strings.CutPrefix(index.IndexName, "idx_"+from+"_"); ok {
			index.IndexName = "idx_" + to + "_" + suffix
			collection.Indexes[i] = index.Build()
		}
	}

	return app.Save(collection)
}
