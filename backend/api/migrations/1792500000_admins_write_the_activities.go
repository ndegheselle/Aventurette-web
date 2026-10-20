package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Only an admin writes what the authoring screens write: the activities, everything hanging off
// them, and the materials catalogue. The tags, safety instructions and tips already ask for it.
// Reading stays open to everyone.
//
// The rollback restores the rules the snapshot had.
func init() {
	m.Register(func(app core.App) error {
		for _, name := range adminWrittenCollections {
			if err := setWriteRules(app, name, adminWriteRule, adminWriteRule, adminWriteRule); err != nil {
				return err
			}
		}
		return nil
	}, func(app core.App) error {
		for _, name := range adminWrittenCollections {
			if err := setWriteRules(app, name, "", "", ""); err != nil {
				return err
			}
		}
		// An activity was its author's to change.
		const authorRule = "user.id = @request.auth.id"
		return setWriteRules(app, "activities", "", authorRule, authorRule)
	})
}

var adminWrittenCollections = []string{
	"activities",
	"activities_steps",
	"steps_resources",
	"activities_workshops",
	"activities_materials",
	"catalog_materials",
}

func setWriteRules(app core.App, name string, create string, update string, delete string) error {
	collection, err := app.FindCollectionByNameOrId(name)
	if err != nil {
		return err
	}

	collection.CreateRule, collection.UpdateRule, collection.DeleteRule = &create, &update, &delete
	return app.Save(collection)
}
