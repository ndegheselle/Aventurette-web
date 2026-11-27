package importer

import (
	"database/sql"
	"errors"
	"fmt"
	"path"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/filesystem"
)

// saveError is a write the collections refused, and the fiche it was for: empty for the glossary.
type saveError struct {
	folder string
	err    error
}

func (e *saveError) Error() string { return e.err.Error() }

// write imports a checked zip, all of it in one transaction: the glossary first, then each fiche.
// A refused write undoes the whole import.
func write(app core.App, plan *glossaryPlan, fiches []checkedFiche, author string) error {
	return app.RunInTransaction(func(tx core.App) error {
		if plan != nil {
			if err := writeGlossary(tx, plan); err != nil {
				return &saveError{err: err}
			}
		}

		// Read again: the glossary's new entries have their ids now.
		references, err := loadCatalogues(tx)
		if err != nil {
			return err
		}

		for _, item := range fiches {
			if err := writeFiche(tx, item, references, author); err != nil {
				return &saveError{folder: item.folder.name, err: err}
			}
		}
		return nil
	})
}

func writeGlossary(app core.App, plan *glossaryPlan) error {
	for _, change := range append(append([]glossaryWrite{}, plan.creates...), plan.updates...) {
		var record *core.Record
		if change.id == "" {
			collection, err := app.FindCachedCollectionByNameOrId(change.collection)
			if err != nil {
				return err
			}
			record = core.NewRecord(collection)
			record.Set("slug", change.slug)
			if change.kind != "" {
				record.Set("type", change.kind)
			}
		} else {
			found, err := app.FindRecordById(change.collection, change.id)
			if err != nil {
				return err
			}
			record = found
		}

		record.Set("name", change.name)
		if change.collection != "catalog_tags" {
			record.Set("description", change.description)
		}
		if err := app.Save(record); err != nil {
			return fmt.Errorf("%s: %w", change.slug, err)
		}
	}
	return nil
}

// writeFiche writes the activity a fiche describes. A fiche imported again keeps its activity's
// id, author, state, and cover when it gives none; its steps, materials and workshops are created
// again, and the old ones deleted once the activity no longer lists them.
func writeFiche(app core.App, item checkedFiche, references *catalogues, author string) error {
	file := item.fiche

	var activity *core.Record
	var previous map[string][]string
	if item.existing != nil {
		found, err := app.FindRecordById("activities", item.existing.Id)
		if err != nil {
			return err
		}
		activity = found
		previous = map[string][]string{}
		for _, list := range []string{"steps", "workshops", "materials"} {
			previous[list] = activity.GetStringSlice(list)
		}
	} else {
		collection, err := app.FindCachedCollectionByNameOrId("activities")
		if err != nil {
			return err
		}
		activity = core.NewRecord(collection)
		activity.Set("user", author)
		activity.Set("state", "DRAFT")
	}

	setActivityFields(activity, file, references)
	if item.existing == nil {
		// Created bare first: everything below points at it.
		if err := app.Save(activity); err != nil {
			return err
		}
	}

	links, err := writeMaterials(app, activity.Id, file, references)
	if err != nil {
		return err
	}
	recalled := func(names []string) []string {
		var ids []string
		for _, name := range names {
			ids = append(ids, links[nameKey(name)]...)
		}
		return unique(ids)
	}

	var steps []string
	for _, s := range file.Steps {
		id, err := writeStep(app, activity.Id, s, file, item.folder, references, recalled(s.Materials))
		if err != nil {
			return err
		}
		steps = append(steps, id)
	}

	var workshops []string
	for _, w := range file.Workshops {
		record, err := newRecord(app, "activities_workshops")
		if err != nil {
			return err
		}
		record.Set("activity", activity.Id)
		record.Set("name", w.Name)
		record.Set("theme", w.Theme)
		record.Set("challenges", w.Challenges)
		record.Set("adults_required", orZero(w.AdultsRequired))
		record.Set("materials", recalled(w.Materials))
		if err := app.Save(record); err != nil {
			return fmt.Errorf("workshop %q: %w", w.Name, err)
		}
		workshops = append(workshops, record.Id)
	}

	var materials []string
	for _, m := range file.Materials {
		materials = append(materials, links[nameKey(m.Name)]...)
	}
	activity.Set("steps", steps)
	activity.Set("workshops", workshops)
	activity.Set("materials", unique(materials))
	if cover, err := fileOf(item.folder, file.Visual.File); err != nil {
		return err
	} else if cover != nil {
		activity.Set("visual", cover)
	}
	if err := app.Save(activity); err != nil {
		return err
	}

	// Only now: a step or material still listed would take the activity with it.
	for _, list := range []struct{ field, collection string }{
		{"steps", "activities_steps"},
		{"workshops", "activities_workshops"},
		{"materials", "activities_materials"},
	} {
		if err := deleteAll(app, list.collection, previous[list.field]); err != nil {
			return err
		}
	}

	return nil
}

func setActivityFields(activity *core.Record, file *fiche, references *catalogues) {
	tags := func(kind string, slugs []string) []string {
		var ids []string
		for _, slug := range slugs {
			if entry, ok := references.tags[tagKey(kind, slug)]; ok {
				ids = append(ids, entry.id)
			}
		}
		return ids
	}
	var development []string
	for _, axis := range developmentAxes {
		development = append(development, tags(axis.kind, file.Pedagogy.Development[axis.axis])...)
	}

	activity.Set("source_id", file.ID)
	activity.Set("name", file.Name)
	activity.Set("summary", file.Summary)
	activity.Set("description", file.Description)
	activity.Set("visual_brief", file.Visual.Brief)
	activity.Set("gather_duration", orZero(file.GatherDuration))
	activity.Set("format", textOf(file.Classification.Format))
	activity.Set("practices", file.Classification.Practices)
	activity.Set("theme_tags", tags("THEME", file.Classification.Themes))
	activity.Set("imaginary_rule", textOf(file.Imaginary.Rule))
	activity.Set("imaginary_tags", tags("IMAGINARY", file.Imaginary.Universes))
	activity.Set("age_min", orZero(file.Audience.AgeMin))
	activity.Set("age_max", orZero(file.Audience.AgeMax))
	activity.Set("participants_min", orZero(file.Audience.ParticipantsMin))
	activity.Set("participants_max", orZero(file.Audience.ParticipantsMax))
	activity.Set("children_pace", textOf(file.Audience.ChildrenPace))
	activity.Set("age_variants", file.Audience.AgeVariants)
	activity.Set("host_effort", textOf(file.Supervision.HostEffort))
	activity.Set("recommended_hosts_numbers", orZero(file.Supervision.HostsRequired))
	activity.Set("cross_supervision", file.Supervision.CrossSupervision)
	activity.Set("supervision_notes", file.Supervision.Notes)
	activity.Set("indoor", file.Place.Indoor)
	activity.Set("outdoor", file.Place.Outdoor)
	activity.Set("locations", file.Place.Locations)
	activity.Set("conditions", file.Place.Conditions)
	activity.Set("seasons", file.Place.Seasons)
	activity.Set("safety_instructions", bySlug(references.safety, file.Safety))
	activity.Set("goal_tags", tags("GOAL", file.Pedagogy.Goals))
	activity.Set("ideal_for_tags", tags("IDEAL_FOR", file.Pedagogy.IdealFor))
	activity.Set("development_tags", development)
}

// writeMaterials links the fiche's materials to the activity, adding to the catalogue the names
// it lacks. It returns the links by nameKey of their name.
func writeMaterials(app core.App, activity string, file *fiche, references *catalogues) (map[string][]string, error) {
	links := map[string][]string{}
	for _, m := range file.Materials {
		key := nameKey(m.Name)
		material, ok := references.materials[key]
		if !ok {
			record, err := newRecord(app, "catalog_materials")
			if err != nil {
				return nil, err
			}
			record.Set("name", strings.TrimSpace(m.Name))
			if err := app.Save(record); err != nil {
				return nil, fmt.Errorf("material %q: %w", m.Name, err)
			}
			material = record.Id
			// A later fiche naming the same new material links this one.
			references.materials[key] = material
		}

		link, err := newRecord(app, "activities_materials")
		if err != nil {
			return nil, err
		}
		link.Set("activity", activity)
		link.Set("material", material)
		link.Set("quantity", m.Quantity)
		if err := app.Save(link); err != nil {
			return nil, fmt.Errorf("material %q: %w", m.Name, err)
		}
		links[key] = append(links[key], link.Id)
	}
	return links, nil
}

// writeStep writes a step and its files. Its actions follow its own text as a numbered list; the
// collection refuses a blank description, so the title stands in for one when there is neither.
func writeStep(app core.App, activity string, s step, file *fiche, folder folder, references *catalogues, materials []string) (string, error) {
	record, err := newRecord(app, "activities_steps")
	if err != nil {
		return "", err
	}

	description := ""
	if !isBlankHTML(s.Description) {
		description = s.Description
	}
	if len(s.Actions) > 0 {
		var list strings.Builder
		list.WriteString("<ol>")
		for _, action := range s.Actions {
			list.WriteString("<li>" + escape(action) + "</li>")
		}
		list.WriteString("</ol>")
		description += list.String()
	}
	if description == "" {
		description = "<p>" + escape(s.Title) + "</p>"
	}

	record.Set("activity", activity)
	record.Set("kind", s.Kind)
	record.Set("title", s.Title)
	record.Set("duration", orZero(s.Duration))
	record.Set("description", description)
	record.Set("advice", s.Advice)
	record.Set("visual_brief", s.Visual.Brief)
	record.Set("end_criteria", s.EndCriteria)
	record.Set("end_criteria_other", s.EndCriteriaOther)
	record.Set("materials", materials)
	record.Set("tips", bySlug(references.tips, s.Tips))
	if picture, err := fileOf(folder, s.Visual.File); err != nil {
		return "", err
	} else if picture != nil {
		record.Set("visual", picture)
	}
	if err := app.Save(record); err != nil {
		return "", fmt.Errorf("step %q: %w", s.Title, err)
	}

	// Its files point at it, so they come after it, and it lists them once they exist.
	var resources []string
	for _, name := range s.Resources {
		for _, resource := range file.Resources {
			if nameKey(resource.Name) != nameKey(name) {
				continue
			}
			upload, err := fileOf(folder, &resource.File)
			if err != nil || upload == nil {
				return "", err
			}
			stored, err := newRecord(app, "steps_resources")
			if err != nil {
				return "", err
			}
			stored.Set("step", record.Id)
			stored.Set("name", resource.Name)
			stored.Set("file", upload)
			if err := app.Save(stored); err != nil {
				return "", fmt.Errorf("resource %q: %w", resource.Name, err)
			}
			resources = append(resources, stored.Id)
			break
		}
	}
	if len(resources) > 0 {
		record.Set("resources", resources)
		if err := app.Save(record); err != nil {
			return "", fmt.Errorf("step %q: %w", s.Title, err)
		}
	}

	return record.Id, nil
}

func newRecord(app core.App, collection string) (*core.Record, error) {
	found, err := app.FindCachedCollectionByNameOrId(collection)
	if err != nil {
		return nil, err
	}
	return core.NewRecord(found), nil
}

// fileOf is the upload of a file of the folder, or nil when the fiche names none.
func fileOf(folder folder, name *string) (*filesystem.File, error) {
	if name == nil || *name == "" {
		return nil, nil
	}
	data, ok := folder.files[*name]
	if !ok {
		return nil, nil
	}
	return filesystem.NewFileFromBytes(data, path.Base(*name))
}

func deleteAll(app core.App, collection string, ids []string) error {
	for _, id := range ids {
		record, err := app.FindRecordById(collection, id)
		if errors.Is(err, sql.ErrNoRows) {
			continue // already gone with a cascade
		}
		if err != nil {
			return err
		}
		if err := app.Delete(record); err != nil {
			return err
		}
	}
	return nil
}

func bySlug(catalogue map[string]catalogueEntry, slugs []string) []string {
	var ids []string
	for _, slug := range slugs {
		if entry, ok := catalogue[slug]; ok {
			ids = append(ids, entry.id)
		}
	}
	return unique(ids)
}

func unique(ids []string) []string {
	seen := map[string]bool{}
	result := []string{}
	for _, id := range ids {
		if !seen[id] {
			seen[id] = true
			result = append(result, id)
		}
	}
	return result
}

func orZero(value *int) int {
	if value == nil {
		return 0
	}
	return *value
}

func textOf(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

// escape writes text into HTML. Quotes are left as they are: the text sits between tags.
func escape(text string) string {
	return strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;").Replace(text)
}
