package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Sign-up opens, and only an account whose email is verified signs in.
//
// Anyone may create an account, without a role. It starts unverified: the first sign-in code
// sent to its email verifies it, since PocketBase marks the account verified when a code sent to
// its own email is used. The auth rule then refuses a session to an account that never was —
// whatever the method, the password included. A token issued before is refused by the
// `registerVerifiedOnly` hook.
//
// The rollback closes sign-up and lifts the auth rule.
func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		signUpRule := "@request.body.role:isset = false"
		users.CreateRule = &signUpRule

		verifiedOnly := "verified = true"
		users.AuthRule = &verifiedOnly

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		users.CreateRule = nil

		anyone := ""
		users.AuthRule = &anyone

		return app.Save(users)
	})
}
