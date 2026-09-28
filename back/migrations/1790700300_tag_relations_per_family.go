package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Splits `activities.tags` into one relation per place a tag goes in the activity's families,
// so each family writes its own field. The tags stay one collection. See
// docs/adr/0014-activity-tags-are-one-collection.md.
//
// Schema only: the links an activity had are not carried over. Which kinds each field accepts is
// checked by `back/hooks`, since a relation cannot be restricted to one `type`.
func init() {
	m.Register(splitTagRelation, mergeTagRelations)
}

// The tag relations on `activities`, in the order the sheet reads them.
var tagRelations = []string{"theme_tags", "imaginary_tags", "safety_tags", "goal_tags", "ideal_for_tags", "development_tags"}

// The single relation as it stood, so a rollback restores it under its id.
const tagsFieldId = "relation1874629670"

func splitTagRelation(app core.App) error {
	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}
	tags, err := app.FindCollectionByNameOrId(tagsCollection)
	if err != nil {
		return err
	}

	activities.Fields.RemoveByName(tagsField)
	for _, name := range tagRelations {
		activities.Fields.Add(&core.RelationField{Name: name, CollectionId: tags.Id, MaxSelect: 999})
	}

	return app.Save(activities)
}

func mergeTagRelations(app core.App) error {
	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}
	tags, err := app.FindCollectionByNameOrId(tagsCollection)
	if err != nil {
		return err
	}

	for _, name := range tagRelations {
		activities.Fields.RemoveByName(name)
	}
	activities.Fields.Add(&core.RelationField{Id: tagsFieldId, Name: tagsField, CollectionId: tags.Id, MaxSelect: 999})

	return app.Save(activities)
}
