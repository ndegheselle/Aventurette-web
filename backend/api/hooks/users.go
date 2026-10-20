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
