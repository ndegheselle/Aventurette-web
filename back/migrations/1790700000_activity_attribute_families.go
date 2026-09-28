package migrations

import (
	"fmt"
	"slices"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Brings `activities` in line with the activity sheet template, whose fields fall into families:
// classification, imaginary, audience, supervision, place, safety and pedagogy. The columns stay
// flat so each one can be filtered on; the grouping is the front's, in the activity mapper. See
// docs/adr/0015-activity-attributes-grouped-by-family.md.
//
// What changes in the data:
//   - `environnement` splits into two flags, `indoor` and `outdoor`, and a `locations` list.
//   - `season` becomes `seasons`, a list of the four seasons. A holiday is not a season: it moves
//     to a THEME tag, as the template has it.
//   - `weather` goes: the template asks for no weather input.
//   - `energy_level` is renamed `host_effort`, which is what it measured.
//   - the FIELD tag kind is renamed THEME, and GOAL and IDEAL_FOR are added.
func init() {
	m.Register(groupActivityAttributes, ungroupActivityAttributes)
}

const activitiesCollection = "activities"

var (
	tagTypesBefore = []string{"FIELD", "IMAGINARY", "SECURITY", "DEVELOP_PHYSICAL", "DEVELOP_INTELLECTUAL", "DEVELOP_AFFECT", "DEVELOP_SOCIAL", "DEVELOP_MORAL", "DEVELOP_SPIRITUAL"}
	tagTypesAfter  = []string{"THEME", "IMAGINARY", "GOAL", "IDEAL_FOR", "SECURITY", "DEVELOP_PHYSICAL", "DEVELOP_INTELLECTUAL", "DEVELOP_AFFECT", "DEVELOP_SOCIAL", "DEVELOP_MORAL", "DEVELOP_SPIRITUAL"}

	environnements = []string{"PARK", "HOUSE", "BALCONY", "CAR", "OUTDOOR", "CITY", "CAMPAIGN", "FOREST", "MOUTAIN", "POOL", "LAKE", "RIVER", "BATH", "MEAL"}
	locations      = []string{"PARK", "HOUSE", "BALCONY", "CAR", "CITY", "CAMPAIGN", "FOREST", "MOUNTAIN", "POOL", "LAKE", "RIVER", "BATH", "MEAL"}
	seasonsBefore  = []string{"AUTUMN", "WINTER", "SPRING", "SUMMER", "CHRISTMAS", "NEW YEAR", "HALLOWEEN", "EASTER", "VALENTINE"}
	seasons        = []string{"AUTUMN", "WINTER", "SPRING", "SUMMER"}
)

// How an old environnement reads as a location and the two place flags. OUTDOOR was a flag all
// along and names no location; a pool, a car or a meal can be either side, so neither flag is set.
var environnementPlaces = map[string]struct {
	location        string
	indoor, outdoor bool
}{
	"OUTDOOR":  {outdoor: true},
	"HOUSE":    {location: "HOUSE", indoor: true},
	"BATH":     {location: "BATH", indoor: true},
	"PARK":     {location: "PARK", outdoor: true},
	"BALCONY":  {location: "BALCONY", outdoor: true},
	"CITY":     {location: "CITY", outdoor: true},
	"CAMPAIGN": {location: "CAMPAIGN", outdoor: true},
	"FOREST":   {location: "FOREST", outdoor: true},
	"MOUTAIN":  {location: "MOUNTAIN", outdoor: true},
	"LAKE":     {location: "LAKE", outdoor: true},
	"RIVER":    {location: "RIVER", outdoor: true},
	"POOL":     {location: "POOL"},
	"CAR":      {location: "CAR"},
	"MEAL":     {location: "MEAL"},
}

// The holidays `season` offered, as the THEME tag each one becomes.
var holidayThemes = map[string]struct{ slug, name string }{
	"CHRISTMAS": {"noel", "Noël"},
	"NEW YEAR":  {"nouvel-an", "Nouvel An"},
	"HALLOWEEN": {"halloween", "Halloween"},
	"EASTER":    {"paques", "Pâques"},
	"VALENTINE": {"saint-valentin", "Saint-Valentin"},
}

// Field ids from the snapshot, so a rollback restores the columns under the ids they had.
const (
	environnementFieldId = "select2731739681"
	seasonFieldId        = "select4041497513"
	weatherFieldId       = "select1288754030"
)

func groupActivityAttributes(app core.App) error {
	if err := renameTagType(app, tagTypesBefore, tagTypesAfter, "FIELD", "THEME"); err != nil {
		return err
	}

	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}

	activities.Fields.GetByName("energy_level").SetName("host_effort")
	activities.Fields.Add(
		&core.TextField{Name: "visual_brief"},
		&core.SelectField{Name: "format", MaxSelect: 1, Values: []string{"SMALL_GAME", "BIG_GAME", "WORKSHOP"}},
		&core.SelectField{Name: "practices", MaxSelect: 6, Values: []string{"MANUAL_CREATION", "EXPRESSION", "COOKING", "OBSERVATION", "MUSIC", "EXPERIMENTATION"}},
		&core.SelectField{Name: "imaginary_rule", MaxSelect: 1, Values: []string{"NONE", "ADAPTABLE", "REQUIRED"}},
		&core.SelectField{Name: "children_pace", MaxSelect: 1, Values: []string{"CALM", "DYNAMIC"}},
		&core.EditorField{Name: "age_variants"},
		&core.BoolField{Name: "cross_supervision"},
		&core.EditorField{Name: "supervision_notes"},
		&core.BoolField{Name: "indoor"},
		&core.BoolField{Name: "outdoor"},
		&core.SelectField{Name: "locations", MaxSelect: len(locations), Values: locations},
		&core.EditorField{Name: "conditions"},
		&core.SelectField{Name: "seasons", MaxSelect: len(seasons), Values: seasons},
	)
	if err := app.Save(activities); err != nil {
		return err
	}

	records, err := app.FindAllRecords(activities)
	if err != nil {
		return err
	}

	for _, activity := range records {
		place := environnementPlaces[activity.GetString("environnement")]
		if place.location != "" {
			activity.Set("locations", []string{place.location})
		}
		activity.Set("indoor", place.indoor)
		activity.Set("outdoor", place.outdoor)

		season := activity.GetString("season")
		if slices.Contains(seasons, season) {
			activity.Set("seasons", []string{season})
		}
		if holiday, ok := holidayThemes[season]; ok {
			theme, err := holidayTheme(app, holiday.slug, holiday.name)
			if err != nil {
				return err
			}
			activity.Set(tagsField, append(activity.GetStringSlice(tagsField), theme.Id))
		}

		// Without validation, as in the tags merge: an older draft breaking an unrelated rule
		// must not block the move.
		if err := app.SaveNoValidate(activity); err != nil {
			return fmt.Errorf("activity %s: %w", activity.Id, err)
		}
	}

	for _, name := range []string{"environnement", "season", "weather"} {
		activities.Fields.RemoveByName(name)
	}

	return app.Save(activities)
}

func ungroupActivityAttributes(app core.App) error {
	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		return err
	}

	activities.Fields.GetByName("host_effort").SetName("energy_level")
	activities.Fields.Add(
		&core.SelectField{Id: environnementFieldId, Name: "environnement", MaxSelect: 1, Values: environnements},
		&core.SelectField{Id: seasonFieldId, Name: "season", MaxSelect: 1, Values: seasonsBefore},
		&core.SelectField{Id: weatherFieldId, Name: "weather", MaxSelect: 1, Values: []string{"RAIN", "SNOW", "SUNNY", "WINDY"}},
	)
	if err := app.Save(activities); err != nil {
		return err
	}

	holidayOf, err := holidaysByTagId(app)
	if err != nil {
		return err
	}

	records, err := app.FindAllRecords(activities)
	if err != nil {
		return err
	}

	// A list folds back into one value, so the first one is kept: the rollback is lossy.
	for _, activity := range records {
		activity.Set("environnement", environnementOf(activity))

		if kept := activity.GetStringSlice("seasons"); len(kept) > 0 {
			activity.Set("season", kept[0])
		} else {
			for _, id := range activity.GetStringSlice(tagsField) {
				if holiday, ok := holidayOf[id]; ok {
					activity.Set("season", holiday)
					break
				}
			}
		}

		if err := app.SaveNoValidate(activity); err != nil {
			return fmt.Errorf("activity %s: %w", activity.Id, err)
		}
	}

	activities.Fields.GetByName("environnement").(*core.SelectField).Required = true
	for _, name := range []string{"visual_brief", "format", "practices", "imaginary_rule", "children_pace", "age_variants", "cross_supervision", "supervision_notes", "indoor", "outdoor", "locations", "conditions", "seasons"} {
		activities.Fields.RemoveByName(name)
	}
	if err := app.Save(activities); err != nil {
		return err
	}

	// Kinds the old list does not have: their tags have nowhere to go. Deleting one unlinks it
	// from every activity, since `activities.tags` does not cascade.
	for _, kind := range []string{"GOAL", "IDEAL_FOR"} {
		tags, err := app.FindRecordsByFilter(tagsCollection, "type = {:type}", "", 0, 0, dbx.Params{"type": kind})
		if err != nil {
			return err
		}
		for _, tag := range tags {
			if err := app.Delete(tag); err != nil {
				return err
			}
		}
	}

	return renameTagType(app, tagTypesAfter, tagTypesBefore, "THEME", "FIELD")
}

// renameTagType moves every tag of kind `from` to kind `to`, then leaves `type` offering exactly
// `values`. Both kinds are offered while the rows move, since a save checks the value against
// the list.
func renameTagType(app core.App, current []string, values []string, from string, to string) error {
	tags, err := app.FindCollectionByNameOrId(tagsCollection)
	if err != nil {
		return err
	}

	typeField := tags.Fields.GetByName("type").(*core.SelectField)
	typeField.Values = append(slices.Clone(current), to)
	if err := app.Save(tags); err != nil {
		return err
	}

	records, err := app.FindRecordsByFilter(tags, "type = {:type}", "", 0, 0, dbx.Params{"type": from})
	if err != nil {
		return err
	}
	for _, record := range records {
		record.Set("type", to)
		if err := app.Save(record); err != nil {
			return fmt.Errorf("%s %s: %w", tagsCollection, record.Id, err)
		}
	}

	typeField.Values = values
	return app.Save(tags)
}

// holidayTheme is the THEME tag standing for a holiday, created the first time one is needed.
func holidayTheme(app core.App, slug string, name string) (*core.Record, error) {
	existing, err := app.FindFirstRecordByFilter(tagsCollection, "type = 'THEME' && slug = {:slug}", dbx.Params{"slug": slug})
	if err == nil {
		return existing, nil
	}

	tags, err := app.FindCollectionByNameOrId(tagsCollection)
	if err != nil {
		return nil, err
	}

	theme := core.NewRecord(tags)
	theme.Set("type", "THEME")
	theme.Set("slug", slug)
	theme.Set("name", name)

	return theme, app.Save(theme)
}

// holidaysByTagId maps the id of each holiday THEME tag to the season value it came from.
func holidaysByTagId(app core.App) (map[string]string, error) {
	holidays := map[string]string{}
	for season, holiday := range holidayThemes {
		tag, err := app.FindFirstRecordByFilter(tagsCollection, "type = 'THEME' && slug = {:slug}", dbx.Params{"slug": holiday.slug})
		if err != nil {
			continue // never created: no activity carried that holiday
		}
		holidays[tag.Id] = season
	}

	return holidays, nil
}

// environnementOf folds the place back into the one required value the old column took.
func environnementOf(activity *core.Record) string {
	for _, location := range activity.GetStringSlice("locations") {
		for environnement, place := range environnementPlaces {
			if place.location == location {
				return environnement
			}
		}
	}

	if activity.GetBool("indoor") && !activity.GetBool("outdoor") {
		return "HOUSE"
	}

	return "OUTDOOR"
}
