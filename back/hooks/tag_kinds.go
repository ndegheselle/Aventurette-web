package hooks

import (
	"fmt"
	"slices"

	"github.com/pocketbase/pocketbase/core"
	validation "github.com/pocketbase/ozzo-validation/v4"
)

const (
	activitiesCollection = "activities"
	tagsCollection       = "tags"
)

// The tag kinds each of an activity's tag relations accepts. Every relation points at the same
// collection, and PocketBase cannot restrict one to the records of a `type`, so it is checked here.
var tagKindsByField = map[string][]string{
	"theme_tags":       {"THEME"},
	"imaginary_tags":   {"IMAGINARY"},
	"safety_tags":      {"SECURITY"},
	"goal_tags":        {"GOAL"},
	"ideal_for_tags":   {"IDEAL_FOR"},
	"development_tags": {"DEVELOP_PHYSICAL", "DEVELOP_INTELLECTUAL", "DEVELOP_AFFECT", "DEVELOP_SOCIAL", "DEVELOP_MORAL", "DEVELOP_SPIRITUAL"},
}

// registerTagKindsCheck refuses an activity linking a tag in a relation not meant for its kind.
// The error is keyed by the field, so the form shows it against the picker that caused it.
func registerTagKindsCheck(app core.App) {
	app.OnRecordValidate(activitiesCollection).BindFunc(func(e *core.RecordEvent) error {
		errs := validation.Errors{}

		for field, kinds := range tagKindsByField {
			ids := e.Record.GetStringSlice(field)
			if len(ids) == 0 {
				continue
			}

			tags, err := e.App.FindRecordsByIds(tagsCollection, ids)
			if err != nil {
				return err
			}

			for _, tag := range tags {
				if !slices.Contains(kinds, tag.GetString("type")) {
					errs[field] = validation.NewError(
						"validation_invalid_tag_kind",
						fmt.Sprintf("%q is a %s tag, which does not go here.", tag.GetString("name"), tag.GetString("type")),
					)
					break
				}
			}
		}

		if len(errs) > 0 {
			return errs
		}

		return e.Next()
	})
}
