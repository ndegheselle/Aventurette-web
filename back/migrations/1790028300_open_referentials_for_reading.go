package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The nine referentials were created with no API rules at all, which in PocketBase means
// superusers only. Nothing noticed while no screen read them; the filter bar does, and every tag
// dropdown came back `403 Only superusers can perform this action`.
//
// They are opened for **reading only**, to match `activities` and `activities_steps`, which are
// already listable and viewable by anyone. That is the whole of the exposure: these rows are the
// seeded Glossaire — a domain, an imaginary universe, a safety tag — and hold nothing a user
// owns. Writing stays superuser-only, so adding a keyword is still a migration or the Dashboard.
func init() {
	m.Register(func(app core.App) error {
		return setReferentialReadRules(app, pointer(""))
	}, func(app core.App) error {
		return setReferentialReadRules(app, nil)
	})
}

// setReferentialReadRules points every referential's list and view rules at the same value —
// `""` for "anyone", nil for "superusers only".
func setReferentialReadRules(app core.App, rule *string) error {
	for _, collectionName := range translatedCollections() {
		collection, err := app.FindCollectionByNameOrId(collectionName)
		if err != nil {
			return fmt.Errorf("collection %s: %w", collectionName, err)
		}

		collection.ListRule = rule
		collection.ViewRule = rule

		if err := app.Save(collection); err != nil {
			return err
		}
	}

	return nil
}

func pointer(value string) *string {
	return &value
}
