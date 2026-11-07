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

func TestSignUpIsClosed(t *testing.T) {
	scenario := tests.ApiScenario{
		Name:            "refuses a sign-up: only a superuser creates accounts during the beta",
		Method:          http.MethodPost,
		URL:             "/api/collections/users/records",
		Body:            strings.NewReader(`{"email":"new@test.local","password":"Passw0rd1234","passwordConfirm":"Passw0rd1234"}`),
		TestAppFactory:  newTestApp,
		ExpectedStatus:  http.StatusForbidden,
		ExpectedContent: []string{`"data":{}`},
	}

	scenario.Test(t)
}

// The users collection is the list of beta testers: a code is issued to an account that exists,
// and to nobody else.
func TestSignInCode(t *testing.T) {
	scenarios := []tests.ApiScenario{
		{
			Name:            "issues a code to an existing account",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/request-otp",
			Body:            strings.NewReader(`{"email":"tester@test.local"}`),
			TestAppFactory:  newTestAppWithTester,
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`"otpId"`},
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				if count := otpCount(t, app); count != 1 {
					t.Fatalf("expected one code issued, got %d", count)
				}
			},
		},
		{
			Name:            "issues nothing to an email that is not on the list",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/request-otp",
			Body:            strings.NewReader(`{"email":"stranger@test.local"}`),
			TestAppFactory:  newTestAppWithTester,
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`"otpId"`},
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				if count := otpCount(t, app); count != 0 {
					t.Fatalf("expected no code issued, got %d", count)
				}
			},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func newTestAppWithTester(t testing.TB) *tests.TestApp {
	app := newTestApp(t)

	users, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		t.Fatal(err)
	}
	tester := core.NewRecord(users)
	tester.SetEmail("tester@test.local")
	tester.SetRandomPassword()
	if err := app.Save(tester); err != nil {
		t.Fatal(err)
	}

	return app
}

func otpCount(t testing.TB, app *tests.TestApp) int {
	otps, err := app.FindAllRecords(core.CollectionNameOTPs)
	if err != nil {
		t.Fatal(err)
	}
	return len(otps)
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
