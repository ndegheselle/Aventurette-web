package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// An activity is saved as one batch (ADR 0017): the activity, its material links, its steps and
// their files, its workshops, in a single transaction. PocketBase ships with batching off.
//
// `1790840000_batch_writes.go` turned it on, and was lost when the migrations were squashed: the
// snapshot keeps the collections, not the settings. This one does it again, so a new instance
// can save an activity. Running it where batching is already on changes nothing but the limits.
//
// The limits are sized for one activity: a few dozen links, steps and workshops, and up to ten
// files per step. The timeout covers the uploads, which run inside the transaction.
func init() {
	m.Register(func(app core.App) error {
		settings := app.Settings()
		settings.Batch.Enabled = true
		settings.Batch.MaxRequests = 300
		settings.Batch.Timeout = 30

		return app.Save(settings)
	}, func(app core.App) error {
		settings := app.Settings()
		settings.Batch.Enabled = false
		settings.Batch.MaxRequests = 50
		settings.Batch.Timeout = 3

		return app.Save(settings)
	})
}
