package hooks

import (
	"github.com/pocketbase/pocketbase/core"
	validation "github.com/pocketbase/ozzo-validation/v4"
)

const plannedBlocksCollection = "planned_blocks"

// registerPlannedBlockEndCheck refuses a planned block that does not end after it starts,
// whichever app writes it. The error is keyed by `end`.
func registerPlannedBlockEndCheck(app core.App) {
	app.OnRecordValidate(plannedBlocksCollection).BindFunc(func(e *core.RecordEvent) error {
		start := e.Record.GetDateTime("start")
		end := e.Record.GetDateTime("end")

		// An unset date is the `Required` check's to report.
		if !start.IsZero() && !end.IsZero() && !end.Time().After(start.Time()) {
			return validation.Errors{
				"end": validation.NewError("validation_end_not_after_start", "A block ends after it starts."),
			}
		}

		return e.Next()
	})
}
