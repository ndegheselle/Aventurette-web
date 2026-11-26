package importer

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"os"
	"sort"
	"testing"
)

// The fiche docs/user/import documents, as the assistant writes it.
func exampleFiche(t testing.TB) map[string]any {
	data, err := os.ReadFile("../../../docs/user/import/example/130973697/activity.json")
	if err != nil {
		t.Fatal(err)
	}
	var fiche map[string]any
	if err := json.Unmarshal(data, &fiche); err != nil {
		t.Fatal(err)
	}
	return fiche
}

// The glossary that holds every identifier the example fiche names.
func exampleGlossary() map[string]any {
	tag := func(kind, id string) map[string]any { return map[string]any{"kind": kind, "id": id, "name": id} }
	entry := func(id string) map[string]any { return map[string]any{"id": id, "name": id, "description": ""} }
	return map[string]any{
		"schema": glossaryFormat,
		"tags": []any{
			tag("THEME", "vie-au-camp"), tag("THEME", "communication"),
			tag("IMAGINARY", "post-apocalyptique"),
			tag("GOAL", "cooperation"), tag("GOAL", "concentration"), tag("GOAL", "memoire"), tag("GOAL", "ecoute"),
			tag("IDEAL_FOR", "conclure-un-temps-collectif"),
			tag("DEVELOP_PHYSICAL", "connaitre-et-reguler-son-corps"),
			tag("DEVELOP_INTELLECTUAL", "apprendre-et-memoriser"), tag("DEVELOP_INTELLECTUAL", "raisonner-et-resoudre"),
			tag("DEVELOP_SOCIAL", "communiquer-et-ecouter"), tag("DEVELOP_SOCIAL", "cooperer-et-s-entraider"),
			tag("DEVELOP_MORAL", "perseverance-et-courage"),
		},
		"tips":   []any{entry("constitution-equipes"), entry("annoncer-fin"), entry("mener-un-debriefing")},
		"safety": []any{entry("meteo-extreme"), entry("premiers-secours")},
	}
}

// The catalogues once the example glossary is applied to empty ones.
func exampleCatalogues(t testing.TB) *catalogues {
	g := &glossary{}
	if problems := decodeMarked(jsonOf(t, exampleGlossary()), glossaryFormat, g); len(problems) > 0 {
		t.Fatal(problems)
	}
	empty := &catalogues{tags: map[string]catalogueEntry{}, tips: map[string]catalogueEntry{}, safety: map[string]catalogueEntry{}, materials: map[string]string{}}
	return empty.after(planGlossary(g, empty))
}

var pdf = []byte("%PDF-1.4\n%%EOF\n")

// The example fiche's folder, with its one resource.
func exampleFiles(t testing.TB, fiche map[string]any) map[string][]byte {
	return map[string][]byte{
		"130973697/activity.json":             jsonOf(t, fiche),
		"130973697/ressources/code-morse.pdf": pdf,
	}
}

func jsonOf(t testing.TB, value any) []byte {
	data, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	return data
}

// zipOf zips these files, in the order of their paths.
func zipOf(t testing.TB, files map[string][]byte) []byte {
	paths := make([]string, 0, len(files))
	for path := range files {
		paths = append(paths, path)
	}
	sort.Strings(paths)

	var buffer bytes.Buffer
	writer := zip.NewWriter(&buffer)
	for _, path := range paths {
		entry, err := writer.Create(path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := entry.Write(files[path]); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	return buffer.Bytes()
}

func errorsIn(problems []problem) []problem {
	var errors []problem
	for _, p := range problems {
		if p.Level == "error" {
			errors = append(errors, p)
		}
	}
	return errors
}

func containsProblem(problems []problem, wanted problem) bool {
	for _, p := range problems {
		if p == wanted {
			return true
		}
	}
	return false
}
