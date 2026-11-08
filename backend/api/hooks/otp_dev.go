package hooks

import (
	"log"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/osutils"
)

// registerDevOTPLog prints a sign-in code to the terminal instead of emailing it, when the backend
// runs from source (`go run`) with no SMTP server configured. Without it nobody could sign in from a
// development machine: the login screen offers codes only, and PocketBase deletes a code whose
// email failed to send. A built binary always sends the email.
func registerDevOTPLog(app core.App) {
	if !osutils.IsProbablyGoRun() {
		return
	}

	app.OnMailerRecordOTPSend().BindFunc(func(e *core.MailerRecordEvent) error {
		if e.App.Settings().SMTP.Enabled {
			return e.Next()
		}

		log.Printf("sign-in code for %s: %v (no SMTP configured, so it was not emailed)", e.Record.Email(), e.Meta["password"])
		return nil
	})
}
