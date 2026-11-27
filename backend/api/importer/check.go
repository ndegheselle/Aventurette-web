package importer

import (
	"fmt"
	"regexp"
	"slices"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

// How many files one step may carry, as the editor allows.
const maxStepResources = 10

// catalogues are what a fiche's identifiers and names are looked up in.
type catalogues struct {
	tags      map[string]catalogueEntry // by tagKey(kind, slug)
	tips      map[string]catalogueEntry // by slug
	safety    map[string]catalogueEntry // by slug
	materials map[string]string         // a catalogue material's id, by nameKey of its name
}

type catalogueEntry struct {
	id          string // empty for an entry the glossary is about to create
	name        string
	description string
}

func tagKey(kind string, slug string) string {
	return kind + ":" + slug
}

// nameKey is how two spellings of a material or resource name are told to be the same.
func nameKey(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}

func loadCatalogues(app core.App) (*catalogues, error) {
	result := &catalogues{
		tags:      map[string]catalogueEntry{},
		tips:      map[string]catalogueEntry{},
		safety:    map[string]catalogueEntry{},
		materials: map[string]string{},
	}

	tags, err := app.FindAllRecords("catalog_tags")
	if err != nil {
		return nil, err
	}
	for _, tag := range tags {
		result.tags[tagKey(tag.GetString("type"), tag.GetString("slug"))] = catalogueEntry{id: tag.Id, name: tag.GetString("name")}
	}

	for collection, into := range map[string]map[string]catalogueEntry{"catalog_tips": result.tips, "catalog_safety_instructions": result.safety} {
		records, err := app.FindAllRecords(collection)
		if err != nil {
			return nil, err
		}
		for _, record := range records {
			if slug := record.GetString("slug"); slug != "" {
				into[slug] = catalogueEntry{id: record.Id, name: record.GetString("name"), description: record.GetString("description")}
			}
		}
	}

	materials, err := app.FindAllRecords("catalog_materials")
	if err != nil {
		return nil, err
	}
	for _, material := range materials {
		result.materials[nameKey(material.GetString("name"))] = material.Id
	}

	return result, nil
}

// ── The glossary ────────────────────────────────────────────────────────────────────────────

// glossaryWrite is one entry the glossary creates or changes.
type glossaryWrite struct {
	collection  string
	id          string // empty for a new entry
	kind        string // a tag's type
	slug        string
	name        string
	description string
}

type glossaryPlan struct {
	creates    []glossaryWrite
	updates    []glossaryWrite
	duplicates []string // identifiers the file gives twice, as `kind:id` for a tag
}

// planGlossary is what applying the file to the catalogues writes. An entry is found by its
// identifier — a tag's within its kind: a known one takes the file's name and description when
// they differ, an unknown one is created. An entry the file leaves out is kept: fiches already
// imported may still point at it.
func planGlossary(file *glossary, known *catalogues) glossaryPlan {
	plan := glossaryPlan{}
	seen := map[string]bool{}
	firstTime := func(key string) bool {
		if seen[key] {
			plan.duplicates = append(plan.duplicates, key)
			return false
		}
		seen[key] = true
		return true
	}

	for _, tag := range file.Tags {
		key := tagKey(tag.Kind, tag.ID)
		if !firstTime(key) {
			continue
		}
		write := glossaryWrite{collection: "catalog_tags", kind: tag.Kind, slug: tag.ID, name: tag.Name}
		if entry, ok := known.tags[key]; !ok {
			plan.creates = append(plan.creates, write)
		} else if entry.name != tag.Name {
			write.id = entry.id
			plan.updates = append(plan.updates, write)
		}
	}

	described := func(entries []glossaryEntry, catalogue map[string]catalogueEntry, collection string, kind string) {
		for _, item := range entries {
			if !firstTime(kind + ":" + item.ID) {
				continue
			}
			write := glossaryWrite{collection: collection, slug: item.ID, name: item.Name, description: item.Description}
			if entry, ok := catalogue[item.ID]; !ok {
				plan.creates = append(plan.creates, write)
			} else if entry.name != item.Name || entry.description != item.Description {
				write.id = entry.id
				plan.updates = append(plan.updates, write)
			}
		}
	}
	described(file.Tips, known.tips, "catalog_tips", "tip")
	described(file.Safety, known.safety, "catalog_safety_instructions", "safety")

	return plan
}

// after is the catalogues once the plan is written: what the fiches of the same zip are checked
// against, so a fiche may use an entry the zip adds.
func (c *catalogues) after(plan glossaryPlan) *catalogues {
	result := &catalogues{
		tags:      maps(c.tags),
		tips:      maps(c.tips),
		safety:    maps(c.safety),
		materials: c.materials,
	}
	for _, write := range append(slices.Clone(plan.creates), plan.updates...) {
		entry := catalogueEntry{id: write.id, name: write.name, description: write.description}
		switch write.collection {
		case "catalog_tags":
			result.tags[tagKey(write.kind, write.slug)] = entry
		case "catalog_tips":
			result.tips[write.slug] = entry
		default:
			result.safety[write.slug] = entry
		}
	}
	return result
}

func maps(source map[string]catalogueEntry) map[string]catalogueEntry {
	copied := make(map[string]catalogueEntry, len(source))
	for key, value := range source {
		copied[key] = value
	}
	return copied
}

// ── The zip ─────────────────────────────────────────────────────────────────────────────────

// checked is everything the import would do, and everything wrong with it.
type checked struct {
	report   report
	glossary *glossaryPlan // nil when the zip has no glossary
	fiches   []checkedFiche
}

type checkedFiche struct {
	folder   folder
	fiche    *fiche
	existing *core.Record // the activity an earlier import made of the fiche, or nil
}

// checkZip checks a zip against the catalogues. The glossary is planned first and the fiches
// checked against the catalogues it leaves. `existing` finds the activity an earlier import made
// of a fiche, by its page id.
func checkZip(zip *importZip, known *catalogues, existing func(sourceID string) *core.Record) *checked {
	result := &checked{report: report{Problems: []problem{}, Fiches: []ficheReport{}}}

	if len(zip.folders) == 0 {
		result.report.Problems = append(result.report.Problems, errorOf("noFiche", "", ""))
	}
	for _, path := range zip.stray {
		result.report.Problems = append(result.report.Problems, warningOf("unusedFile", "", path))
	}

	references := known
	if zip.glossary != nil {
		file := &glossary{}
		problems := decodeMarked(zip.glossary, glossaryFormat, file)
		plan := glossaryPlan{}
		if len(problems) == 0 {
			plan = planGlossary(file, known)
		}
		for _, key := range plan.duplicates {
			problems = append(problems, errorOf("duplicateEntry", "", key))
		}
		result.glossary = &plan
		result.report.Glossary = &glossaryReport{Created: len(plan.creates), Updated: len(plan.updates), Problems: orEmpty(problems)}
		references = known.after(plan)
	}

	for _, folder := range zip.folders {
		entry := ficheReport{Folder: folder.name, Problems: []problem{}}
		file := &fiche{}
		problems := decodeMarked(folder.json, ficheFormat, file)
		if len(problems) == 0 && file.ID != folder.name {
			problems = []problem{errorOf("folder", "", file.ID)}
		}
		if len(problems) > 0 {
			entry.Problems = problems
			result.report.Fiches = append(result.report.Fiches, entry)
			continue
		}

		entry.Name, entry.Readable = file.Name, true
		entry.Problems = append(ficheProblems(file, folder, references), unusedFiles(file, folder)...)
		previous := existing(file.ID)
		entry.Update = previous != nil

		result.report.Fiches = append(result.report.Fiches, entry)
		result.fiches = append(result.fiches, checkedFiche{folder: folder, fiche: file, existing: previous})
	}

	return result
}

func orEmpty(problems []problem) []problem {
	if problems == nil {
		return []problem{}
	}
	return problems
}

// unusedFiles warns of the folder's files the fiche does not name: they are not imported.
func unusedFiles(file *fiche, folder folder) []problem {
	named := map[string]bool{}
	if file.Visual.File != nil {
		named[*file.Visual.File] = true
	}
	for _, s := range file.Steps {
		if s.Visual.File != nil {
			named[*s.Visual.File] = true
		}
	}
	for _, resource := range file.Resources {
		named[resource.File] = true
	}

	var problems []problem
	for _, path := range folder.paths {
		if !named[path] {
			problems = append(problems, warningOf("unusedFile", "", path))
		}
	}
	return problems
}

// ── A fiche ─────────────────────────────────────────────────────────────────────────────────

// ficheProblems is what the schema cannot say: identifiers the catalogues lack, files the folder
// lacks, names a step or workshop gives that the fiche does not list. Then what the author should
// look at: new materials, rows « à valider », fields left empty.
func ficheProblems(file *fiche, folder folder, references *catalogues) []problem {
	problems := []problem{}
	add := func(p problem) { problems = append(problems, p) }

	checkIds := func(ids []string, path string, label string, exists func(string) bool) {
		for index, id := range ids {
			if !exists(id) {
				p := errorOf("reference", fmt.Sprintf("%s[%d]", path, index), id)
				p.Label = label
				add(p)
			}
		}
	}
	checkTags := func(ids []string, path string, kind string) {
		checkIds(ids, path, "activities.tagType."+kind, func(id string) bool {
			_, ok := references.tags[tagKey(kind, id)]
			return ok
		})
	}
	inCatalogue := func(catalogue map[string]catalogueEntry) func(string) bool {
		return func(id string) bool {
			_, ok := catalogue[id]
			return ok
		}
	}

	checkTags(file.Classification.Themes, "classification.themes", "THEME")
	checkTags(file.Imaginary.Universes, "imaginary.universes", "IMAGINARY")
	checkTags(file.Pedagogy.Goals, "pedagogy.goals", "GOAL")
	checkTags(file.Pedagogy.IdealFor, "pedagogy.idealFor", "IDEAL_FOR")
	for _, axis := range developmentAxes {
		checkTags(file.Pedagogy.Development[axis.axis], "pedagogy.development."+axis.axis, axis.kind)
	}
	checkIds(file.Safety, "safety", "activities.fields.safetyInstructions", inCatalogue(references.safety))

	checkFile := func(path *string, at string) {
		if path == nil || *path == "" {
			return
		}
		data, ok := folder.files[*path]
		if !ok {
			add(errorOf("missingFile", at, *path))
		} else if len(data) > maxFileSize {
			add(errorOf("fileSize", at, *path))
		}
	}
	checkFile(file.Visual.File, "visual.file")
	for index, resource := range file.Resources {
		checkFile(&resource.File, fmt.Sprintf("resources[%d].file", index))
	}

	listed := map[string]bool{}
	for _, material := range file.Materials {
		listed[nameKey(material.Name)] = true
	}
	resources := map[string]bool{}
	for _, resource := range file.Resources {
		resources[nameKey(resource.Name)] = true
	}
	checkNames := func(names []string, path string, known map[string]bool, code string) {
		for index, name := range names {
			if !known[nameKey(name)] {
				add(errorOf(code, fmt.Sprintf("%s[%d]", path, index), name))
			}
		}
	}

	for index, w := range file.Workshops {
		checkNames(w.Materials, fmt.Sprintf("workshops[%d].materials", index), listed, "unlistedMaterial")
	}

	for index, s := range file.Steps {
		path := fmt.Sprintf("steps[%d]", index)
		checkNames(s.Materials, path+".materials", listed, "unlistedMaterial")
		checkNames(s.Resources, path+".resources", resources, "unlistedResource")
		checkIds(s.Tips, path+".tips", "activities.tips.title", inCatalogue(references.tips))
		checkFile(s.Visual.File, path+".visual.file")
		if len(s.Resources) > maxStepResources {
			add(errorOf("tooManyResources", path+".resources", fmt.Sprint(maxStepResources)))
		}
		if s.Duration == nil {
			add(warningOf("noDuration", path+".duration", s.Title))
		}
	}

	for _, material := range file.Materials {
		if _, ok := references.materials[nameKey(material.Name)]; !ok {
			add(warningOf("newMaterial", "", material.Name))
		}
	}

	used := map[string]bool{}
	for _, s := range file.Steps {
		for _, name := range s.Resources {
			used[nameKey(name)] = true
		}
	}
	for _, resource := range file.Resources {
		if !used[nameKey(resource.Name)] {
			add(warningOf("unattachedResource", "", resource.Name))
		}
	}

	for _, row := range file.ToConfirm {
		add(warningOf("toConfirm", "", row))
	}

	for _, label := range unsetFields(file) {
		add(problem{Level: "warning", Code: "unset", Label: label})
	}

	return problems
}

// unsetFields are the fields the template expects that the fiche leaves empty, as translation keys.
func unsetFields(file *fiche) []string {
	development := false
	for _, ids := range file.Pedagogy.Development {
		development = development || len(ids) > 0
	}
	blank := func(s *string) bool { return s == nil || *s == "" }

	checks := []struct {
		unset bool
		label string
	}{
		{strings.TrimSpace(file.Summary) == "", "activities.fields.summary"},
		{isBlankHTML(file.Description), "activities.authoring.description"},
		{strings.TrimSpace(file.Visual.Brief) == "" && blank(file.Visual.File), "activities.fields.visualBrief"},
		{blank(file.Classification.Format), "activities.fields.format"},
		{len(file.Classification.Themes) == 0, "activities.tagType.THEME"},
		{blank(file.Imaginary.Rule), "activities.fields.imaginaryRule"},
		{file.Audience.AgeMin == nil && file.Audience.AgeMax == nil, "activities.fields.age"},
		{file.Audience.ParticipantsMin == nil && file.Audience.ParticipantsMax == nil, "activities.fields.participants"},
		{blank(file.Audience.ChildrenPace), "activities.fields.childrenPace"},
		{blank(file.Supervision.HostEffort), "activities.fields.hostEffort"},
		{file.Supervision.HostsRequired == nil, "activities.fields.hosts"},
		{!file.Place.Indoor && !file.Place.Outdoor, "activities.authoring.import.unset.indoorOutdoor"},
		{len(file.Place.Seasons) == 0, "activities.fields.seasons"},
		{len(file.Pedagogy.Goals) == 0, "activities.tagType.GOAL"},
		{!development, "activities.families.development"},
	}

	var labels []string
	for _, check := range checks {
		if check.unset {
			labels = append(labels, check.label)
		}
	}
	return labels
}

var htmlTag = regexp.MustCompile(`<[^>]*>`)

// isBlankHTML is whether rich text holds no text: an emptied editor leaves `<p></p>` behind.
func isBlankHTML(html string) bool {
	text := strings.ReplaceAll(htmlTag.ReplaceAllString(html, ""), "&nbsp;", " ")
	return strings.TrimSpace(text) == ""
}
