package importer

import (
	"reflect"
	"testing"

	"github.com/pocketbase/pocketbase/core"
)

func noExisting(string) *core.Record { return nil }

func checkFiles(t *testing.T, files map[string][]byte, known *catalogues) *checked {
	t.Helper()
	zip, err := readZip(zipOf(t, files))
	if err != nil {
		t.Fatal(err)
	}
	return checkZip(zip, known, noExisting)
}

// The example fiche, checked alone against the example's catalogues.
func ficheErrors(t *testing.T, fiche map[string]any, files map[string][]byte) []problem {
	t.Helper()
	result := checkFiles(t, files, exampleCatalogues(t))
	if len(result.report.Fiches) != 1 {
		t.Fatalf("expected one fiche, got %d", len(result.report.Fiches))
	}
	return errorsIn(result.report.Fiches[0].Problems)
}

func TestTheDocumentedExampleHasNoErrorOnceItsIdentifiersAreKnown(t *testing.T) {
	fiche := exampleFiche(t)
	if errors := ficheErrors(t, fiche, exampleFiles(t, fiche)); len(errors) > 0 {
		t.Fatalf("expected no error, got %v", errors)
	}
}

func TestRefusesAnIdentifierTheCatalogueLacks(t *testing.T) {
	fiche := exampleFiche(t)
	fiche["safety"] = []any{"meteo-extreme", "photosensibilite"}

	got := ficheErrors(t, fiche, exampleFiles(t, fiche))

	want := []problem{{Level: "error", Code: "reference", Path: "safety[1]", Value: "photosensibilite", Label: "activities.fields.safetyInstructions"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
}

func TestLooksATagUpInItsOwnKindOnly(t *testing.T) {
	fiche := exampleFiche(t)
	fiche["imaginary"] = map[string]any{"rule": nil, "universes": []any{"communication"}}

	got := ficheErrors(t, fiche, exampleFiles(t, fiche))

	if len(got) != 1 || got[0].Path != "imaginary.universes[0]" {
		t.Fatalf("expected one error at imaginary.universes[0], got %v", got)
	}
}

func TestRefusesAFileTheFolderLacksAndOneTooBig(t *testing.T) {
	fiche := exampleFiche(t)
	fiche["visual"] = map[string]any{"brief": "", "file": "couverture.png"}
	files := exampleFiles(t, fiche)
	files["130973697/ressources/code-morse.pdf"] = make([]byte, maxFileSize+1)

	var codes []string
	for _, p := range ficheErrors(t, fiche, files) {
		codes = append(codes, p.Code)
	}

	if !reflect.DeepEqual(codes, []string{"missingFile", "fileSize"}) {
		t.Fatalf("expected missingFile then fileSize, got %v", codes)
	}
}

func TestRefusesAStepNamingWhatTheFicheDoesNotListWhateverTheCase(t *testing.T) {
	fiche := exampleFiche(t)
	first := fiche["steps"].([]any)[0].(map[string]any)
	first["materials"] = []any{"lampe FRONTALE", "Boussole"}
	first["resources"] = []any{"Cartes-messages"}

	got := ficheErrors(t, fiche, exampleFiles(t, fiche))

	want := []problem{
		{Level: "error", Code: "unlistedMaterial", Path: "steps[0].materials[1]", Value: "Boussole"},
		{Level: "error", Code: "unlistedResource", Path: "steps[0].resources[0]", Value: "Cartes-messages"},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
}

func TestWarnsOfANewMaterialAndOfAFileNoFicheNames(t *testing.T) {
	fiche := exampleFiche(t)
	files := exampleFiles(t, fiche)
	files["130973697/brouillon.png"] = pdf

	result := checkFiles(t, files, exampleCatalogues(t))
	problems := result.report.Fiches[0].Problems

	for _, wanted := range []problem{
		warningOf("newMaterial", "", "Sifflet"),
		warningOf("unusedFile", "", "brouillon.png"),
	} {
		if !containsProblem(problems, wanted) {
			t.Fatalf("expected %v among %v", wanted, problems)
		}
	}
	if hasErrors(&result.report) {
		t.Fatalf("expected warnings only, got %v", errorsIn(problems))
	}
}

func TestReadsAFicheWithAMalformedValueAsMalformedAtItsKey(t *testing.T) {
	fiche := exampleFiche(t)
	fiche["gatherDuration"] = "trente"

	got := ficheErrors(t, fiche, exampleFiles(t, fiche))

	want := []problem{{Level: "error", Code: "malformed", Path: "gatherDuration"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
}

func TestRefusesAFicheWhoseFolderIsNotNamedAfterItsId(t *testing.T) {
	fiche := exampleFiche(t)

	result := checkFiles(t, map[string][]byte{"42/activity.json": jsonOf(t, fiche)}, exampleCatalogues(t))

	want := []problem{errorOf("folder", "", "130973697")}
	if got := result.report.Fiches[0].Problems; !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
}

func TestRefusesAFileThatDoesNotSayItIsAFiche(t *testing.T) {
	result := checkFiles(t, map[string][]byte{"1/activity.json": []byte(`{"schema":"aventurette.glossary.v1"}`)}, exampleCatalogues(t))

	want := []problem{errorOf("format", "", ficheFormat)}
	if got := result.report.Fiches[0].Problems; !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
}

func TestRefusesAZipWithNoFiche(t *testing.T) {
	result := checkFiles(t, map[string][]byte{"notes.txt": []byte("x")}, exampleCatalogues(t))

	if !containsProblem(result.report.Problems, errorOf("noFiche", "", "")) {
		t.Fatalf("expected noFiche, got %v", result.report.Problems)
	}
}

func TestChecksAFicheAgainstTheGlossaryOfTheSameZip(t *testing.T) {
	fiche := exampleFiche(t)
	files := exampleFiles(t, fiche)
	files["glossary.json"] = jsonOf(t, exampleGlossary())
	empty := &catalogues{tags: map[string]catalogueEntry{}, tips: map[string]catalogueEntry{}, safety: map[string]catalogueEntry{}, materials: map[string]string{}}

	result := checkFiles(t, files, empty)

	if errors := errorsIn(result.report.Fiches[0].Problems); len(errors) > 0 {
		t.Fatalf("expected no error, got %v", errors)
	}
	if result.report.Glossary.Created != 19 {
		t.Fatalf("expected 19 entries created, got %d", result.report.Glossary.Created)
	}
}

func TestReadsAZipThatWrapsEverythingInOneMoreFolder(t *testing.T) {
	zip, err := readZip(zipOf(t, map[string][]byte{
		"export/glossary.json":               []byte("{}"),
		"export/130973697/activity.json":     []byte("{}"),
		"export/130973697/ressources/a.pdf":  pdf,
		"notes.txt":                          []byte("x"),
		"__MACOSX/130973697/._activity.json": []byte("x"),
	}))
	if err != nil {
		t.Fatal(err)
	}

	if string(zip.glossary) != "{}" || len(zip.folders) != 1 || zip.folders[0].name != "130973697" {
		t.Fatalf("expected the glossary and one fiche, got %+v", zip)
	}
	if !reflect.DeepEqual(zip.folders[0].paths, []string{"ressources/a.pdf"}) {
		t.Fatalf("expected the fiche's file by its path in the folder, got %v", zip.folders[0].paths)
	}
	if !reflect.DeepEqual(zip.stray, []string{"notes.txt"}) {
		t.Fatalf("expected notes.txt alone set apart, got %v", zip.stray)
	}
}

func TestGlossaryFindsATagByItsKindAndIdentifier(t *testing.T) {
	known := &catalogues{tags: map[string]catalogueEntry{tagKey("THEME", "animaux"): {id: "t1", name: "Animaux"}}}
	file := &glossary{}
	file.Tags = append(file.Tags, struct {
		Kind string `json:"kind"`
		ID   string `json:"id"`
		Name string `json:"name"`
	}{"IMAGINARY", "animaux", "Animaux"})

	plan := planGlossary(file, known)

	if len(plan.creates) != 1 || plan.creates[0].kind != "IMAGINARY" {
		t.Fatalf("expected the IMAGINARY tag created, got %+v", plan.creates)
	}
}

func TestGlossaryChangesAKnownEntryAndLeavesOneThatSaysTheSameAlone(t *testing.T) {
	known := &catalogues{safety: map[string]catalogueEntry{
		"feu": {id: "s1", name: "Feu", description: "<p>Old.</p>"},
		"eau": {id: "s2", name: "Eau", description: "<p>Same.</p>"},
	}}
	file := &glossary{Safety: []glossaryEntry{
		{ID: "feu", Name: "Feu de camp", Description: "<p>New.</p>"},
		{ID: "eau", Name: "Eau", Description: "<p>Same.</p>"},
	}}

	plan := planGlossary(file, known)

	want := []glossaryWrite{{collection: "catalog_safety_instructions", id: "s1", slug: "feu", name: "Feu de camp", description: "<p>New.</p>"}}
	if !reflect.DeepEqual(plan.updates, want) || len(plan.creates) != 0 {
		t.Fatalf("expected feu updated alone, got updates %+v creates %+v", plan.updates, plan.creates)
	}
}

func TestGlossaryReportsAnIdentifierGivenTwiceAndPlansItOnce(t *testing.T) {
	tip := glossaryEntry{ID: "annoncer-fin", Name: "Annoncer la fin"}
	known := &catalogues{tips: map[string]catalogueEntry{}}

	plan := planGlossary(&glossary{Tips: []glossaryEntry{tip, tip}}, known)

	if !reflect.DeepEqual(plan.duplicates, []string{"tip:annoncer-fin"}) || len(plan.creates) != 1 {
		t.Fatalf("expected one duplicate and one create, got %+v", plan)
	}
}
