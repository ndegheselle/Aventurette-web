package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// A tip's slug is the identifier a sheet names it by, so two tips cannot share one and it is
// written like a safety instruction's: lowercase letters, digits and dashes. It stays optional —
// the tips that came off the steps have none — so the index leaves the empty ones out.
func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId(catalogPrefix + tipsCollection)
		if err != nil {
			return err
		}

		collection.Fields.GetByName("slug").(*core.TextField).Pattern = slugPattern
		collection.AddIndex(tipSlugIndex, true, "`slug`", "`slug` != ''")

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId(catalogPrefix + tipsCollection)
		if err != nil {
			return err
		}

		collection.Fields.GetByName("slug").(*core.TextField).Pattern = ""
		collection.RemoveIndex(tipSlugIndex)

		return app.Save(collection)
	})
}

const (
	slugPattern  = `^[a-z0-9-]+$`
	tipSlugIndex = "idx_catalog_tips_slug"
)
