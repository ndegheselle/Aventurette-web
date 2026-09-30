package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// `activities_tags` becomes `tags`, as `activities_materials` became `materials`: a catalogue is
// named for what it holds, and the `activities_` prefix is kept for the records an activity owns.
//
// The relations pointing at it hold its id, not its name, so they carry over as they are. Its
// unique index is renamed with it. The earlier migrations still say `activities_tags`: they run
// against the database as it was when they were written.
func init() {
	m.Register(func(app core.App) error {
		return renameTagsCollection(app, tagsCollection, "tags")
	}, func(app core.App) error {
		return renameTagsCollection(app, "tags", tagsCollection)
	})
}

func renameTagsCollection(app core.App, from string, to string) error {
	tags, err := app.FindCollectionByNameOrId(from)
	if err != nil {
		return err
	}

	tags.RemoveIndex("idx_" + from + "_type_slug")
	tags.Name = to
	tags.AddIndex("idx_"+to+"_type_slug", true, "`type`, `slug`", "")

	return app.Save(tags)
}
