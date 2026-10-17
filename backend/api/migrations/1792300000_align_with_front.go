package migrations

import (
	"slices"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/dbutils"
)

// Brings the schema to the one the front is generated from (`frontend/web/src/backend/schema.g.ts`),
// which the squashed snapshot missed part of:
//   - `tags` and `materials` take the `catalog_` prefix, and admins write the tags;
//   - `activities.safety_tags`, the SECURITY tag kind and `tags.description` go: safety
//     instructions have their own catalogue;
//   - `activities_steps.tip` goes: a step links catalogue tips;
//   - `catalog_tips.slug` goes;
//   - a step's kind is PREPARE, CUSTOM or CONCLUSION; the others become CUSTOM.
//
// Destructive: the rollback restores the names and the columns, not what they held.
func init() {
	m.Register(alignWithFront, unalignWithFront)
}

var (
	alignedStepKinds = []string{"PREPARE", "CUSTOM", "CONCLUSION"}
	legacyStepKinds  = []string{"PREPARE", "EXPLAIN", "TEAMS", "LAUNCH", "CUSTOM", "ANNOUNCE_END", "CONCLUSION"}
	legacyTagKinds   = []string{"THEME", "IMAGINARY", "GOAL", "IDEAL_FOR", "SECURITY", "DEVELOP_PHYSICAL", "DEVELOP_INTELLECTUAL", "DEVELOP_AFFECT", "DEVELOP_SOCIAL", "DEVELOP_MORAL", "DEVELOP_SPIRITUAL"}
)

const adminWriteRule = `@request.auth.role = "ADMIN"`

func alignWithFront(app core.App) error {
	activities, err := app.FindCollectionByNameOrId("activities")
	if err != nil {
		return err
	}
	activities.Fields.RemoveByName("safety_tags")
	if err := app.Save(activities); err != nil {
		return err
	}

	tags, err := app.FindCollectionByNameOrId("tags")
	if err != nil {
		return err
	}
	securityTags, err := app.FindRecordsByFilter(tags, "type = 'SECURITY'", "", 0, 0)
	if err != nil {
		return err
	}
	for _, tag := range securityTags {
		if err := app.Delete(tag); err != nil {
			return err
		}
	}
	tagKind := tags.Fields.GetByName("type").(*core.SelectField)
	tagKind.Values = slices.DeleteFunc(slices.Clone(tagKind.Values), func(kind string) bool { return kind == "SECURITY" })
	tags.Fields.RemoveByName("description")
	rule := adminWriteRule
	tags.CreateRule, tags.UpdateRule, tags.DeleteRule = &rule, &rule, &rule
	if err := app.Save(tags); err != nil {
		return err
	}

	steps, err := app.FindCollectionByNameOrId("activities_steps")
	if err != nil {
		return err
	}
	if _, err := app.DB().Update(
		"activities_steps",
		dbx.Params{"kind": "CUSTOM"},
		dbx.NotIn("kind", "PREPARE", "CUSTOM", "CONCLUSION"),
	).Execute(); err != nil {
		return err
	}
	steps.Fields.GetByName("kind").(*core.SelectField).Values = slices.Clone(alignedStepKinds)
	steps.Fields.RemoveByName("tip")
	if err := app.Save(steps); err != nil {
		return err
	}

	tips, err := app.FindCollectionByNameOrId("catalog_tips")
	if err != nil {
		return err
	}
	tips.RemoveIndex("idx_catalog_tips_slug")
	tips.Fields.RemoveByName("slug")
	if err := app.Save(tips); err != nil {
		return err
	}

	if err := renameCollection(app, "tags", "catalog_tags"); err != nil {
		return err
	}
	return renameCollection(app, "materials", "catalog_materials")
}

func unalignWithFront(app core.App) error {
	if err := renameCollection(app, "catalog_materials", "materials"); err != nil {
		return err
	}
	if err := renameCollection(app, "catalog_tags", "tags"); err != nil {
		return err
	}

	tips, err := app.FindCollectionByNameOrId("catalog_tips")
	if err != nil {
		return err
	}
	tips.Fields.AddAt(1, &core.TextField{Name: "slug"})
	tips.AddIndex("idx_catalog_tips_slug", true, "`slug`", "`slug` != ''")
	if err := app.Save(tips); err != nil {
		return err
	}

	steps, err := app.FindCollectionByNameOrId("activities_steps")
	if err != nil {
		return err
	}
	steps.Fields.GetByName("kind").(*core.SelectField).Values = slices.Clone(legacyStepKinds)
	steps.Fields.Add(&core.EditorField{Name: "tip"})
	if err := app.Save(steps); err != nil {
		return err
	}

	tags, err := app.FindCollectionByNameOrId("tags")
	if err != nil {
		return err
	}
	tags.Fields.GetByName("type").(*core.SelectField).Values = slices.Clone(legacyTagKinds)
	tags.Fields.Add(&core.EditorField{Name: "description"})
	if err := app.Save(tags); err != nil {
		return err
	}

	activities, err := app.FindCollectionByNameOrId("activities")
	if err != nil {
		return err
	}
	activities.Fields.Add(&core.RelationField{Name: "safety_tags", CollectionId: tags.Id, MaxSelect: 999})
	return app.Save(activities)
}

// renameCollection renames a collection and the indexes named after it. Relations hold its id,
// so they follow.
func renameCollection(app core.App, from string, to string) error {
	collection, err := app.FindCollectionByNameOrId(from)
	if err != nil {
		return err
	}

	collection.Name = to
	for i, raw := range collection.Indexes {
		index := dbutils.ParseIndex(raw)
		if suffix, ok := strings.CutPrefix(index.IndexName, "idx_"+from+"_"); ok {
			index.IndexName = "idx_" + to + "_" + suffix
			collection.Indexes[i] = index.Build()
		}
	}

	return app.Save(collection)
}
