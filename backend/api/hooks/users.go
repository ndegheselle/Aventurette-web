package hooks

import "github.com/pocketbase/pocketbase/core"

const (
	usersCollection = "users"
	defaultRole     = "USER"
)

// registerDefaultRole makes a user created without a role a plain user. `role` is required, and
// the sign-up rule refuses a body that sets it, so without this nobody could sign up. Runs before
// the record is validated.
func registerDefaultRole(app core.App) {
	app.OnRecordCreate(usersCollection).BindFunc(func(e *core.RecordEvent) error {
		if e.Record.GetString("role") == "" {
			e.Record.Set("role", defaultRole)
		}
		return e.Next()
	})
}

// registerSignUpWithoutPassword lets a sign-up send an email and a name only: the app signs in
// with a code, so the account gets a random password nobody knows. PocketBase requires one.
func registerSignUpWithoutPassword(app core.App) {
	app.OnRecordCreateRequest(usersCollection).BindFunc(func(e *core.RecordRequestEvent) error {
		if e.Record.GetString("password") == "" {
			e.Record.SetRandomPassword()
		}
		return e.Next()
	})
}

// registerVerifiedOnly refuses any request made with the token of a user whose email is not
// verified. The `users` auth rule already refuses them a session; this covers a token issued
// before it, or before a superuser unticked `verified`. Superusers are not users and pass.
func registerVerifiedOnly(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Bound after PocketBase's own middlewares, so the token is already read into e.Auth.
		se.Router.BindFunc(func(e *core.RequestEvent) error {
			if e.Auth != nil && e.Auth.Collection().Name == usersCollection && !e.Auth.Verified() {
				return e.ForbiddenError("The email of this account is not verified.", nil)
			}
			return e.Next()
		})
		return se.Next()
	})
}
