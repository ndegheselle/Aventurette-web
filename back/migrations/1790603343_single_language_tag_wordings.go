package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// A tag's `name` and `description` go back from one wording per locale to plain text, in one
// language. A systematic way to translate data is to come; until then, carrying a wording per
// locale cost every reader a lookup and a fallback for an English that was only a first pass.
//
// The French wording is the one kept: every row was seeded with it, and `fr` is the app's
// fallback. A row with no French keeps whichever wording it has.
//
// As in `1790028100_i18n_reference_wordings.go`, each field is dropped and re-added rather than
// retyped in place, so the values are read before and written back after.
func init() {
	m.Register(func(app core.App) error {
		return rewriteTagWordings(app, oneWording, func(name string, required bool) core.Field {
			// A safety tag's description is the list of precautions it stands for, in HTML.
			if name == "description" {
				return &core.EditorField{Name: name, Required: required}
			}
			return &core.TextField{Name: name, Required: required}
		})
	}, func(app core.App) error {
		return rewriteTagWordings(app, func(record *core.Record, field string) any {
			if value := record.GetString(field); value != "" {
				return map[string]string{"fr": value}
			}
			return nil
		}, func(name string, required bool) core.Field {
			return &core.JSONField{Name: name, Required: required}
		})
	})
}

// rewriteTagWordings retypes `name` and `description` on `activities_tags` with `field`, keeping
// each where it sat, and writes back what `read` made of the value each row held before.
func rewriteTagWordings(
	app core.App,
	read func(record *core.Record, field string) any,
	field func(name string, required bool) core.Field,
) error {
	tags, err := app.FindCollectionByNameOrId(tagsCollection)
	if err != nil {
		return fmt.Errorf("collection %s: %w", tagsCollection, err)
	}

	records, err := app.FindAllRecords(tags)
	if err != nil {
		return err
	}

	wordings := make(map[string]map[string]any, len(records))
	for _, record := range records {
		wordings[record.Id] = map[string]any{
			"name":        read(record, "name"),
			"description": read(record, "description"),
		}
	}

	for _, name := range []string{"name", "description"} {
		position := fieldPosition(tags, name)
		tags.Fields.RemoveByName(name)
		tags.Fields.AddAt(position, field(name, name == "name"))
	}

	if err := app.Save(tags); err != nil {
		return err
	}

	for id, values := range wordings {
		record, err := app.FindRecordById(tags, id)
		if err != nil {
			return err
		}

		for name, value := range values {
			record.Set(name, value)
		}

		if err := app.Save(record); err != nil {
			return fmt.Errorf("%s %s: %w", tagsCollection, id, err)
		}
	}

	return nil
}

// fieldPosition is where the field named `name` sits, or the end if it is not there.
func fieldPosition(collection *core.Collection, name string) int {
	for i, field := range collection.Fields {
		if field.GetName() == name {
			return i
		}
	}

	return len(collection.Fields)
}

// oneWording reads a per-locale column as the one wording it keeps: `fr`, or else any other.
func oneWording(record *core.Record, field string) any {
	var wording map[string]string
	if err := record.UnmarshalJSONField(field, &wording); err != nil {
		return ""
	}

	if wording["fr"] != "" {
		return wording["fr"]
	}
	for _, value := range wording {
		if value != "" {
			return value
		}
	}

	return ""
}
