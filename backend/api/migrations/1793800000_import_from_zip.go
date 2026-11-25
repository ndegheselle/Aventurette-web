package migrations

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"golang.org/x/text/unicode/norm"
)

// Fiches are imported from a zip of JSON written in Confluence (ADR 0026):
//
//   - `activities.source_id` is the fiche's Confluence page id. Importing the fiche again
//     updates the activity holding it, so it is unique.
//   - `activities.gather_duration`: the minutes of « Rassembler le matériel », the step the app
//     generates from the material list. It counts in the preparation time.
//   - `activities_steps.visual` and `activities_steps.advice`: a step's picture, and the advice
//     written for this fiche rather than taken from the tips catalogue.
//   - `catalog_tips.slug` comes back: the import names a tip by its identifier in the
//     référentiel. Existing tips get one made from their name.
//   - The catalogues' `aliases` go, where an earlier build of this branch added them: wording is
//     resolved in Confluence now, against the glossary.
var slugUnsafe = regexp.MustCompile(`[^a-z0-9]+`)

// slugOf spells a name the way `slugify` does in the back office.
func slugOf(name string) string {
	var plain strings.Builder
	for _, r := range norm.NFD.String(strings.ToLower(name)) {
		switch {
		case r >= 0x300 && r <= 0x36f:
		case r == 'œ':
			plain.WriteString("oe")
		case r == 'æ':
			plain.WriteString("ae")
		default:
			plain.WriteRune(r)
		}
	}
	return strings.Trim(slugUnsafe.ReplaceAllString(plain.String(), "-"), "-")
}

func init() {
	m.Register(func(app core.App) error {
		for _, name := range []string{"catalog_tags", "catalog_safety_instructions", "catalog_tips"} {
			collection, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				return err
			}
			if collection.Fields.GetByName("aliases") == nil {
				continue
			}
			collection.Fields.RemoveByName("aliases")
			if err := app.Save(collection); err != nil {
				return err
			}
		}

		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}
		activities.Fields.Add(
			&core.TextField{Name: "source_id", Pattern: `^[0-9]*$`},
			&core.NumberField{Name: "gather_duration", OnlyInt: true, Min: floatPtr(0)},
		)
		activities.AddIndex("idx_activities_source_id", true, "`source_id`", "`source_id` != ''")
		if err := app.Save(activities); err != nil {
			return err
		}

		steps, err := app.FindCollectionByNameOrId("activities_steps")
		if err != nil {
			return err
		}
		steps.Fields.Add(
			&core.FileField{
				Name:      "visual",
				MaxSelect: 1,
				MaxSize:   2 << 20,
				MimeTypes: []string{"image/png", "image/jpeg"},
			},
			&core.EditorField{Name: "advice"},
		)
		if err := app.Save(steps); err != nil {
			return err
		}

		tips, err := app.FindCollectionByNameOrId("catalog_tips")
		if err != nil {
			return err
		}
		tips.Fields.AddAt(1, &core.TextField{Name: "slug", Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`})
		if err := app.Save(tips); err != nil {
			return err
		}

		records, err := app.FindAllRecords(tips)
		if err != nil {
			return err
		}
		taken := map[string]bool{}
		for _, record := range records {
			base := slugOf(record.GetString("name"))
			if base == "" {
				base = "conseil"
			}
			slug := base
			for n := 2; taken[slug]; n++ {
				slug = fmt.Sprintf("%s-%d", base, n)
			}
			taken[slug] = true
			record.Set("slug", slug)
			if err := app.SaveNoValidate(record); err != nil {
				return err
			}
		}

		tips.AddIndex("idx_catalog_tips_slug", true, "`slug`", "`slug` != ''")
		return app.Save(tips)
	}, func(app core.App) error {
		tips, err := app.FindCollectionByNameOrId("catalog_tips")
		if err != nil {
			return err
		}
		tips.RemoveIndex("idx_catalog_tips_slug")
		tips.Fields.RemoveByName("slug")
		if err := app.Save(tips); err != nil {
			return err
		}

		steps, err := app.FindCollectionByNameOrId("activities_steps")
		if err != nil {
			return err
		}
		steps.Fields.RemoveByName("visual")
		steps.Fields.RemoveByName("advice")
		if err := app.Save(steps); err != nil {
			return err
		}

		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}
		activities.RemoveIndex("idx_activities_source_id")
		activities.Fields.RemoveByName("source_id")
		activities.Fields.RemoveByName("gather_duration")
		return app.Save(activities)
	})
}

func floatPtr(value float64) *float64 {
	return &value
}
