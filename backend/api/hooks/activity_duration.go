package hooks

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// How long an activity takes is the sum of its steps' durations. The catalogue filters on it, and
// a filter cannot add up a relation, so it is stored on the activity and kept in step here.
const refreshDurationQuery = "UPDATE activities SET duration = " +
	"(SELECT COALESCE(SUM(duration), 0) FROM activities_steps WHERE activity = {:id}) " +
	"WHERE id = {:id}"

// registerActivityDuration recomputes an activity's `duration` whenever one of its steps is
// written or deleted, and whenever the activity itself is saved, which also overwrites any
// duration a client sent. It runs inside the write's transaction, so a batch saving an activity
// and its steps lands with the right sum.
func registerActivityDuration(app core.App) {
	refreshParent := func(e *core.RecordEvent) error {
		if err := e.Next(); err != nil {
			return err
		}
		return refreshDuration(e.App, e.Record.GetString("activity"))
	}
	app.OnRecordCreate(stepsCollection).BindFunc(refreshParent)
	app.OnRecordUpdate(stepsCollection).BindFunc(refreshParent)
	app.OnRecordDelete(stepsCollection).BindFunc(refreshParent)

	refreshSelf := func(e *core.RecordEvent) error {
		if err := e.Next(); err != nil {
			return err
		}
		return refreshDuration(e.App, e.Record.Id)
	}
	app.OnRecordCreate(activitiesCollection).BindFunc(refreshSelf)
	app.OnRecordUpdate(activitiesCollection).BindFunc(refreshSelf)
}

// refreshDuration writes the column directly rather than saving the record, so it neither
// touches `updated` nor runs the activity's hooks again.
func refreshDuration(app core.App, activityId string) error {
	if activityId == "" {
		return nil
	}
	_, err := app.DB().NewQuery(refreshDurationQuery).Bind(dbx.Params{"id": activityId}).Execute()
	return err
}
