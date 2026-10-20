package hooks

import (
	"net/http"
	"strings"
	"testing"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"

	_ "backend/migrations"
)

// An app on an empty data dir, with this repository's migrations and hooks.
func newTestApp(t testing.TB) *tests.TestApp {
	app, err := tests.NewTestApp(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	Register(app)
	return app
}

func TestSignUp(t *testing.T) {
	scenarios := []tests.ApiScenario{
		{
			Name:            "signs up a plain user, who sends no role",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/records",
			Body:            strings.NewReader(`{"email":"new@test.local","password":"Passw0rd1234","passwordConfirm":"Passw0rd1234"}`),
			TestAppFactory:  newTestApp,
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`"role":"USER"`},
		},
		{
			Name:            "refuses a sign-up choosing its own role",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/records",
			Body:            strings.NewReader(`{"email":"new@test.local","password":"Passw0rd1234","passwordConfirm":"Passw0rd1234","role":"ADMIN"}`),
			TestAppFactory:  newTestApp,
			ExpectedStatus:  http.StatusBadRequest,
			ExpectedContent: []string{`"data":{}`},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func TestDefaultRoleKeepsAGivenRole(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	users, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		t.Fatal(err)
	}
	admin := core.NewRecord(users)
	admin.SetEmail("admin@test.local")
	admin.SetPassword("Passw0rd1234")
	admin.Set("role", "ADMIN")

	if err := app.Save(admin); err != nil {
		t.Fatal(err)
	}

	if role := admin.GetString("role"); role != "ADMIN" {
		t.Fatalf("expected ADMIN, got %q", role)
	}
}
