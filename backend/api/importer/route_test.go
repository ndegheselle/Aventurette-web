package importer

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"testing"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"

	"backend/hooks"
	_ "backend/migrations"
)

// An app with this repository's migrations, hooks and route, an admin and a plain user.
func newTestApp(t testing.TB) *tests.TestApp {
	app, err := tests.NewTestApp(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	hooks.Register(app)
	Register(app)

	users, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		t.Fatal(err)
	}
	for email, role := range map[string]string{"admin@test.local": "ADMIN", "user@test.local": "USER"} {
		user := core.NewRecord(users)
		user.SetEmail(email)
		user.SetPassword("Passw0rd1234")
		user.SetVerified(true)
		user.Set("role", role)
		if err := app.Save(user); err != nil {
			t.Fatal(err)
		}
	}
	return app
}

func tokenOf(t testing.TB, app core.App, email string) string {
	user, err := app.FindAuthRecordByEmail("users", email)
	if err != nil {
		t.Fatal(err)
	}
	token, err := user.NewAuthToken()
	if err != nil {
		t.Fatal(err)
	}
	return token
}

// importAs sends a zip to the route as email, expects the status, and decodes the report it
// answers. PocketBase serves one request per test app: anything before it calls `run` directly.
func importAs(t *testing.T, app *tests.TestApp, email string, status int, data []byte) *report {
	t.Helper()

	var body bytes.Buffer
	form := multipart.NewWriter(&body)
	part, err := form.CreateFormFile("zip", "import.zip")
	if err != nil {
		t.Fatal(err)
	}
	part.Write(data)
	form.Close()

	headers := map[string]string{"Content-Type": form.FormDataContentType()}
	if email != "" {
		headers["Authorization"] = tokenOf(t, app, email)
	}

	result := &report{}
	scenario := tests.ApiScenario{
		Method:                http.MethodPost,
		URL:                   Route,
		Body:                  &body,
		Headers:               headers,
		TestAppFactory:        func(testing.TB) *tests.TestApp { return app },
		DisableTestAppCleanup: true,
		ExpectedStatus:        status,
		ExpectedContent:       []string{"{"},
		AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
			data, _ := io.ReadAll(res.Body)
			if res.StatusCode == http.StatusOK {
				if err := json.Unmarshal(data, result); err != nil {
					t.Fatal(err)
				}
			}
		},
	}
	scenario.Test(t)
	return result
}

func exampleZip(t testing.TB, change func(fiche map[string]any)) []byte {
	fiche := exampleFiche(t)
	if change != nil {
		change(fiche)
	}
	files := exampleFiles(t, fiche)
	files["glossary.json"] = jsonOf(t, exampleGlossary())
	return zipOf(t, files)
}

func count(t *testing.T, app core.App, collection string, filter string, params map[string]any) int {
	t.Helper()
	records, err := app.FindRecordsByFilter(collection, filter, "", 0, 0, params)
	if err != nil {
		t.Fatal(err)
	}
	return len(records)
}

func TestOnlyAnAdminImports(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	importAs(t, app, "", http.StatusUnauthorized, exampleZip(t, nil))

	plain := newTestApp(t)
	defer plain.Cleanup()
	importAs(t, plain, "user@test.local", http.StatusForbidden, exampleZip(t, nil))
	if n := count(t, plain, "activities", "source_id = '130973697'", nil); n != 0 {
		t.Fatalf("expected nothing written, got %d activities", n)
	}
}

func TestWritesNothingWhenTheCheckFindsAnError(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	result := importAs(t, app, "admin@test.local", http.StatusOK, exampleZip(t, func(fiche map[string]any) {
		fiche["safety"] = []any{"photosensibilite"}
	}))

	if result.Imported {
		t.Fatal("expected the zip not imported")
	}
	if len(errorsIn(result.Fiches[0].Problems)) != 1 {
		t.Fatalf("expected the one error reported, got %v", result.Fiches[0].Problems)
	}
	if n := count(t, app, "catalog_tags", "slug = 'vie-au-camp'", nil); n != 0 {
		t.Fatal("expected the glossary not written either")
	}
}

func TestImportsTheExampleAsADraftOfTheAdminImportingIt(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	result := importAs(t, app, "admin@test.local", http.StatusOK, exampleZip(t, nil))
	if !result.Imported {
		t.Fatalf("expected the zip imported, got %+v", result)
	}

	activity, err := app.FindFirstRecordByData("activities", "source_id", "130973697")
	if err != nil {
		t.Fatal(err)
	}
	admin, _ := app.FindAuthRecordByEmail("users", "admin@test.local")
	if activity.GetString("user") != admin.Id || activity.GetString("state") != "DRAFT" {
		t.Fatalf("expected a draft by the admin, got user=%s state=%s", activity.GetString("user"), activity.GetString("state"))
	}
	if n := len(activity.GetStringSlice("steps")); n != 6 {
		t.Fatalf("expected 6 steps, got %d", n)
	}
	if n := len(activity.GetStringSlice("theme_tags")); n != 2 {
		t.Fatalf("expected 2 themes linked, got %d", n)
	}
	if n := count(t, app, "steps_resources", "step.activity = {:id}", map[string]any{"id": activity.Id}); n != 3 {
		t.Fatalf("expected the Morse code on the 3 steps naming it, got %d", n)
	}
}

func TestImportingAgainReplacesTheActivityAndKeepsItsState(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()
	admin, _ := app.FindAuthRecordByEmail("users", "admin@test.local")
	if _, err := run(app, exampleZip(t, nil), admin.Id); err != nil {
		t.Fatal(err)
	}
	first, _ := app.FindFirstRecordByData("activities", "source_id", "130973697")
	first.Set("state", "PUBLISHED")
	if err := app.Save(first); err != nil {
		t.Fatal(err)
	}

	result := importAs(t, app, "admin@test.local", http.StatusOK, exampleZip(t, func(fiche map[string]any) {
		fiche["name"] = "Les Phares"
		fiche["steps"] = fiche["steps"].([]any)[:2]
	}))

	if !result.Imported || !result.Fiches[0].Update {
		t.Fatalf("expected an update imported, got %+v", result)
	}
	again, _ := app.FindFirstRecordByData("activities", "source_id", "130973697")
	if again.Id != first.Id || again.GetString("state") != "PUBLISHED" || again.GetString("name") != "Les Phares" {
		t.Fatalf("expected the same published activity renamed, got id=%s state=%s name=%s", again.Id, again.GetString("state"), again.GetString("name"))
	}
	if n := count(t, app, "activities_steps", "activity = {:id}", map[string]any{"id": again.Id}); n != 2 {
		t.Fatalf("expected the old steps deleted, got %d steps", n)
	}
}

func TestARefusedWriteUndoesTheWholeImport(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	result := importAs(t, app, "admin@test.local", http.StatusOK, exampleZip(t, func(fiche map[string]any) {
		fiche["steps"].([]any)[3].(map[string]any)["kind"] = "WARM_UP"
	}))

	if result.Imported || len(errorsIn(result.Fiches[0].Problems)) != 1 || result.Fiches[0].Problems[len(result.Fiches[0].Problems)-1].Code != "saveFailed" {
		t.Fatalf("expected the refusal reported on the fiche, got %+v", result)
	}
	if n := count(t, app, "activities", "source_id = '130973697'", nil); n != 0 {
		t.Fatalf("expected no activity left, got %d", n)
	}
	if n := count(t, app, "catalog_tags", "slug = 'vie-au-camp'", nil); n != 0 {
		t.Fatal("expected the glossary undone too")
	}
}

func TestReportsBytesThatAreNotAZip(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	result := importAs(t, app, "admin@test.local", http.StatusOK, []byte("not a zip"))

	if result.Imported || !containsProblem(result.Problems, errorOf("notZip", "", "")) {
		t.Fatalf("expected notZip, got %+v", result)
	}
}
