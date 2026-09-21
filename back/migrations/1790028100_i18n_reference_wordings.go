package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The reference collections hold wordings, not keys. A domain, an imaginary universe, a safety
// tag and the developmental keywords are seeded rather than coded, so they cannot live in the
// front's `locales/` the way the rest of the app's strings do — the translation has to travel
// with the row. Their `name`, and Sécurité's `description`, become JSON holding one entry per
// locale: `{"fr": "…", "en": "…"}`.
//
// Sécurité also gains a `slug`. Its tags are named by the safety referential (`feu`, `eau`, …)
// and a JSON name is no longer something to look a record up by.
//
// Each field is dropped and re-added rather than retyped in place: PocketBase syncs columns by
// field id, so reusing the id would leave the old TEXT column under the new JSON field. The
// collections are referentials seeded by the migration that follows, so there is nothing in
// them to carry across.
func init() {
	m.Register(func(app core.App) error {
		return retypeWordings(app, func(name string) core.Field {
			return &core.JSONField{Name: "name", Required: !optionalName[name]}
		}, func() core.Field {
			return &core.JSONField{Name: "description"}
		}, true)
	}, func(app core.App) error {
		return retypeWordings(app, func(name string) core.Field {
			return &core.TextField{Name: "name", Required: !optionalName[name]}
		}, func() core.Field {
			return &core.EditorField{Name: "description"}
		}, false)
	})
}

// The collections whose wordings are translated. Every one of them is a referential behind a
// relation on `activities`.
func translatedCollections() []string {
	return []string{
		"activities_fields",
		"activities_imaginary",
		securityCollection,
		"activities_develop_physical",
		"activities_develop_intellectual",
		"activities_develop_affect",
		"activities_develop_social",
		"activities_develop_moral",
		"activities_develop_spiritual",
	}
}

const securityCollection = "activities_security"

// `activities_fields.name` was created optional where every other reference name is required.
// Kept as it is: retyping a field is not the place to change what it accepts.
var optionalName = map[string]bool{"activities_fields": true}

// retypeWordings swaps `name` — and, on Sécurité, `description` and its `slug` — for the types
// the given builders produce, keeping each field where it already sat.
func retypeWordings(app core.App, name func(string) core.Field, description func() core.Field, withSlug bool) error {
	for _, collectionName := range translatedCollections() {
		collection, err := app.FindCollectionByNameOrId(collectionName)
		if err != nil {
			return err
		}

		collection.Fields.RemoveByName("name")
		collection.Fields.AddAt(1, name(collectionName))

		if collectionName == securityCollection {
			collection.Fields.RemoveByName("description")
			collection.Fields.AddAt(2, description())

			collection.Fields.RemoveByName("slug")
			if withSlug {
				collection.Fields.AddAt(3, &core.TextField{
					Name:     "slug",
					Required: true,
					Pattern:  `^[a-z0-9-]+$`,
				})
			}
		}

		if err := app.Save(collection); err != nil {
			return err
		}
	}

	return nil
}
