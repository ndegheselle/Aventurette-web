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
			Name:            "creates an unverified plain user from an email and a name, with no password",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/records",
			Body:            strings.NewReader(`{"email":"new@test.local","name":"New"}`),
			TestAppFactory:  newTestApp,
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`"verified":false`},
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				user, err := app.FindAuthRecordByEmail(usersCollection, "new@test.local")
				if err != nil {
					t.Fatal(err)
				}
				if user.Verified() || user.GetString("role") != defaultRole {
					t.Fatalf("expected an unverified %s, got verified=%v role=%q", defaultRole, user.Verified(), user.GetString("role"))
				}
			},
		},
		{
			Name:            "refuses a sign-up that verifies itself",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/records",
			Body:            strings.NewReader(`{"email":"new@test.local","verified":true}`),
			TestAppFactory:  newTestApp,
			ExpectedStatus:  http.StatusBadRequest,
			ExpectedContent: []string{`"verified"`},
		},
		{
			Name:            "refuses a sign-up that sets its own role",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/records",
			Body:            strings.NewReader(`{"email":"new@test.local","role":"ADMIN"}`),
			TestAppFactory:  newTestApp,
			ExpectedStatus:  http.StatusBadRequest,
			ExpectedContent: []string{`"data":{}`},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func TestOnlyAVerifiedUserSignsIn(t *testing.T) {
	scenarios := []tests.ApiScenario{
		{
			Name:            "refuses a password sign-in to an unverified account",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/auth-with-password",
			Body:            strings.NewReader(`{"identity":"tester@test.local","password":"Passw0rd1234"}`),
			TestAppFactory:  newTestAppWithTester,
			ExpectedStatus:  http.StatusForbidden,
			ExpectedContent: []string{`"data":{}`},
		},
		{
			Name:            "signs in a verified account with its password",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/auth-with-password",
			Body:            strings.NewReader(`{"identity":"tester@test.local","password":"Passw0rd1234"}`),
			TestAppFactory:  func(t testing.TB) *tests.TestApp { return withVerifiedTester(t, newTestAppWithTester(t)) },
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`"token"`},
		},
		{
			Name:            "verifies an unverified account with a code sent to its email, and signs it in",
			Method:          http.MethodPost,
			URL:             "/api/collections/users/auth-with-otp",
			Body:            strings.NewReader(`{"otpId":"otpsenttotester","password":"123456"}`),
			TestAppFactory:  newTestAppWithSentCode,
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`"token"`, `"verified":true`},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func TestAnUnverifiedTokenReadsNothing(t *testing.T) {
	refused := asTester(t, newTestAppWithTester(t))
	refused.Name = "refuses a request made with an unverified user's token"
	refused.ExpectedStatus = http.StatusForbidden
	refused.ExpectedContent = []string{`"data":{}`}
	refused.Test(t)

	answered := asTester(t, withVerifiedTester(t, newTestAppWithTester(t)))
	answered.Name = "answers a request made with a verified user's token"
	answered.ExpectedStatus = http.StatusOK
	answered.ExpectedContent = []string{`"totalItems":1`}
	answered.Test(t)
}

// A request to the users list on app, with a token of the tester issued whatever their verified
// state, as one issued before the auth rule would be.
func asTester(t testing.TB, app *tests.TestApp) tests.ApiScenario {
	token, err := findTester(t, app).NewAuthToken()
	if err != nil {
		t.Fatal(err)
	}

	return tests.ApiScenario{
		Method:         http.MethodGet,
		URL:            "/api/collections/users/records",
		Headers:        map[string]string{"Authorization": token},
		TestAppFactory: func(testing.TB) *tests.TestApp { return app },
	}
}

// A code is issued to an account that exists, and to nobody else: signing up comes first.
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
			Name:            "issues nothing to an email with no account",
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
	tester.SetPassword("Passw0rd1234")
	if err := app.Save(tester); err != nil {
		t.Fatal(err)
	}

	return app
}

func findTester(t testing.TB, app core.App) *core.Record {
	tester, err := app.FindAuthRecordByEmail(usersCollection, "tester@test.local")
	if err != nil {
		t.Fatal(err)
	}
	return tester
}

func withVerifiedTester(t testing.TB, app *tests.TestApp) *tests.TestApp {
	tester := findTester(t, app)
	tester.SetVerified(true)
	if err := app.Save(tester); err != nil {
		t.Fatal(err)
	}
	return app
}

// The unverified tester, with the code "123456" sent to their email.
func newTestAppWithSentCode(t testing.TB) *tests.TestApp {
	app := newTestAppWithTester(t)
	tester := findTester(t, app)

	otp := core.NewOTP(app)
	otp.Id = "otpsenttotester"
	otp.SetCollectionRef(tester.Collection().Id)
	otp.SetRecordRef(tester.Id)
	otp.SetPassword("123456")
	otp.SetSentTo(tester.Email())
	if err := app.Save(otp); err != nil {
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
