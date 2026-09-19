package migrations

import (
	"sort"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Moves what the five dropped columns held into the attribute catalogue, between the seed that
// creates the attributes and the migration that drops the columns.
//
// It runs late on a database that already dropped them — PocketBase applies whatever is not in
// `_migrations`, whatever its timestamp — so it checks the columns are still there and does
// nothing when they are not.
//
// Two things it cannot convert, and reports rather than guesses: `CLASSROOM` has no equivalent
// in the Environnement vocabulary, and a benefit whose name is not one of the developmental
// keywords has no option to point at.
func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		if activities.Fields.GetByName("ageMin") == nil {
			app.Logger().Info("activity fields already dropped, nothing to convert")
			return nil
		}

		catalogue, err := readCatalogue(app)
		if err != nil {
			return err
		}

		values, err := app.FindCollectionByNameOrId("activity_attribute_values")
		if err != nil {
			return err
		}
		picks, err := app.FindCollectionByNameOrId("activity_attribute_options")
		if err != nil {
			return err
		}

		records, err := app.FindAllRecords(activities)
		if err != nil {
			return err
		}

		for _, activity := range records {
			ageMin, ageMax := activity.GetFloat("ageMin"), activity.GetFloat("ageMax")
			if ageMin != 0 || ageMax != 0 {
				value := core.NewRecord(values)
				value.Set("activity", activity.Id)
				value.Set("attribute", catalogue.attributes["age"])
				value.Set("range_min", ageMin)
				value.Set("range_max", ageMax)
				if err := app.Save(value); err != nil {
					return err
				}
			}

			if duration := activity.GetFloat("durationMinutes"); duration != 0 {
				value := core.NewRecord(values)
				value.Set("activity", activity.Id)
				value.Set("attribute", catalogue.attributes["temps-jeu"])
				value.Set("number_value", duration)
				if err := app.Save(value); err != nil {
					return err
				}
			}

			if environment := activity.GetString("environment"); environment != "" {
				option := catalogue.options["environnement"][environments[environment]]
				if option == "" {
					app.Logger().Warn("environment has no Environnement option", "activity", activity.Id, "environment", environment)
				} else if err := addPick(app, picks, activity.Id, catalogue.attributes["environnement"], option); err != nil {
					return err
				}
			}

			for _, id := range activity.GetStringSlice("benefits") {
				benefit, err := app.FindRecordById("benefits", id)
				if err != nil {
					app.Logger().Warn("benefit is gone, not converted", "activity", activity.Id, "benefit", id)
					continue
				}

				keyword := slugify(benefit.GetString("name"))
				attribute, option := catalogue.findDevelopmentOption(keyword)
				if attribute == "" {
					app.Logger().Warn("benefit matches no developmental keyword", "activity", activity.Id, "benefit", benefit.GetString("name"))
					continue
				}

				if err := addPick(app, picks, activity.Id, attribute, option); err != nil {
					return err
				}
			}
		}

		return nil
	}, func(app core.App) error {
		// Nothing to undo: the columns this read are restored by the migration above it, and
		// the rows written here cannot be told apart from ones entered since.
		return nil
	})
}

// Where each stored environment lands in the Environnement vocabulary. `CLASSROOM` is absent on
// purpose — the Glossaire has no equivalent, and inventing one is the catalogue's call, not a
// migration's.
var environments = map[string]string{
	"INDOOR":  "maison",
	"OUTDOOR": "exterieur",
	"CAR":     "voiture",
}

// The seeded attributes and options, by slug and value, plus which of them are developmental.
type seededCatalogue struct {
	attributes map[string]string
	// option ids by attribute slug, then by option value
	options map[string]map[string]string
	// the six developmental attribute slugs, in the order a benefit is looked up
	development []string
}

// findDevelopmentOption answers the attribute and option a benefit keyword names, or empty
// strings. The vocabularies overlap in one place — `débattre` is both an intellectual and a
// social keyword — so the slugs are searched in alphabetical order and that one lands under
// Développement intellectuel.
func (c seededCatalogue) findDevelopmentOption(keyword string) (string, string) {
	for _, slug := range c.development {
		if option, found := c.options[slug][keyword]; found {
			return c.attributes[slug], option
		}
	}

	return "", ""
}

func readCatalogue(app core.App) (seededCatalogue, error) {
	catalogue := seededCatalogue{
		attributes: map[string]string{},
		options:    map[string]map[string]string{},
	}

	definitions, err := app.FindAllRecords("attribute_definitions")
	if err != nil {
		return catalogue, err
	}

	groups, err := app.FindAllRecords("groups")
	if err != nil {
		return catalogue, err
	}

	groupSlugs := map[string]string{}
	for _, group := range groups {
		groupSlugs[group.Id] = group.GetString("slug")
	}

	bySlug := map[string]string{} // attribute id -> slug, for the options pass
	for _, definition := range definitions {
		slug := definition.GetString("slug")
		catalogue.attributes[slug] = definition.Id
		catalogue.options[slug] = map[string]string{}
		bySlug[definition.Id] = slug

		// Which attribute is developmental is the group's to say: an attribute's own slug is
		// shorter than its group's ("developpement-moral" under "developpement-moral-caractere").
		if strings.HasPrefix(groupSlugs[definition.GetString("group")], "developpement-") {
			catalogue.development = append(catalogue.development, slug)
		}
	}
	sort.Strings(catalogue.development)

	options, err := app.FindAllRecords("attribute_options")
	if err != nil {
		return catalogue, err
	}

	for _, option := range options {
		if slug, known := bySlug[option.GetString("attribute")]; known {
			catalogue.options[slug][option.GetString("value")] = option.Id
		}
	}

	return catalogue, nil
}

func addPick(app core.App, picks *core.Collection, activity string, attribute string, option string) error {
	pick := core.NewRecord(picks)
	pick.Set("activity", activity)
	pick.Set("attribute", attribute)
	pick.Set("option", option)

	return app.Save(pick)
}
