package hooks

import (
	"github.com/pocketbase/pocketbase/core"
	validation "github.com/pocketbase/ozzo-validation/v4"
)

const plannedActivitiesCollection = "user_planned_activities"

// registerPlannedActivityEndCheck refuses a planned activity that does not end after it starts,
// whichever app writes it. The error is keyed by `end`.
func registerPlannedActivityEndCheck(app core.App) {
	app.OnRecordValidate(plannedActivitiesCollection).BindFunc(func(e *core.RecordEvent) error {
		start := e.Record.GetDateTime("start")
		end := e.Record.GetDateTime("end")

		// An unset date is the `Required` check's to report.
		if !start.IsZero() && !end.IsZero() && !end.Time().After(start.Time()) {
			return validation.Errors{
				"end": validation.NewError("validation_end_not_after_start", "An activity ends after it starts."),
			}
		}

		return e.Next()
	})
}
