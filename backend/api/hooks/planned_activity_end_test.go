package hooks

import (
	"testing"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

func savePlanned(t *testing.T, app *tests.TestApp, start time.Time, end time.Time) error {
	activity := newActivity(t, app)

	planned, err := app.FindCollectionByNameOrId(plannedActivitiesCollection)
	if err != nil {
		t.Fatal(err)
	}
	record := core.NewRecord(planned)
	record.Set("user", activity.GetString("user"))
	record.Set("activity", activity.Id)
	record.Set("start", start)
	record.Set("end", end)
	return app.Save(record)
}

func TestPlannedActivityEndsAfterItStarts(t *testing.T) {
	start := time.Date(2026, 11, 18, 9, 0, 0, 0, time.UTC)
	scenarios := []struct {
		name     string
		end      time.Time
		accepted bool
	}{
		{"accepts one ending after its start", start.Add(45 * time.Minute), true},
		{"refuses one ending as it starts", start, false},
		{"refuses one ending before its start", start.Add(-time.Hour), false},
	}

	for _, scenario := range scenarios {
		t.Run(scenario.name, func(t *testing.T) {
			app := newTestApp(t)
			defer app.Cleanup()

			err := savePlanned(t, app, start, scenario.end)
			if scenario.accepted && err != nil {
				t.Fatalf("expected it saved, got %v", err)
			}
			if !scenario.accepted && err == nil {
				t.Fatal("expected it refused")
			}
		})
	}
}
