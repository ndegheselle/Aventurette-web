package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/osutils"

	"backend/hooks"
	// Registers every migration in the package. Blank: nothing calls into it, the `init` of
	// each file is the point — without this import a fresh database comes up with no
	// collections and `migrate up` has nothing to apply.
	_ "backend/migrations"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: osutils.IsProbablyGoRun(),
	})

	hooks.Register(app)

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
