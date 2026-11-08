package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The beta: testers sign in with a one-time code sent to their email, and only the accounts a
// superuser created exist — the `users` collection is the list of testers. Sign-up is closed.
//
// Password login stays enabled: the login screen no longer offers it, but the development and
// seed accounts still use it.
//
// The rollback reopens sign-up with the rule it had and turns the codes off.
func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		users.CreateRule = nil

		users.OTP.Enabled = true
		users.OTP.Length = 6
		// Ten minutes rather than PocketBase's three: an email can take that long to arrive.
		users.OTP.Duration = 600
		users.OTP.EmailTemplate = core.EmailTemplate{
			Subject: "Votre code de connexion à {APP_NAME}",
			Body: `<p>Bonjour,</p>
<p>Votre code de connexion est : <strong>{OTP}</strong></p>
<p>Il est valable 10 minutes.</p>
<p><i>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail.</i></p>
<p>
  Merci,<br/>
  L'équipe {APP_NAME}
</p>`,
		}

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		signUpRule := "@request.body.role:isset = false"
		users.CreateRule = &signUpRule
		users.OTP.Enabled = false

		return app.Save(users)
	})
}
