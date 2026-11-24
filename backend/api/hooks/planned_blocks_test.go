package hooks

import (
	"testing"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

func newPlannedBlock(t *testing.T, app *tests.TestApp, activity *core.Record, start time.Time, end time.Time) *core.Record {
	blocks, err := app.FindCollectionByNameOrId(plannedBlocksCollection)
	if err != nil {
		t.Fatal(err)
	}
	record := core.NewRecord(blocks)
	record.Set("user", activity.GetString("user"))
	record.Set("activity", activity.Id)
	record.Set("label", activity.GetString("name"))
	record.Set("start", start)
	record.Set("end", end)
	return record
}

func TestPlannedBlockEndsAfterItStarts(t *testing.T) {
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

			err := app.Save(newPlannedBlock(t, app, newActivity(t, app), start, scenario.end))
			if scenario.accepted && err != nil {
				t.Fatalf("expected it saved, got %v", err)
			}
			if !scenario.accepted && err == nil {
				t.Fatal("expected it refused")
			}
		})
	}
}

func TestDeletingAnActivityKeepsItsBlocks(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	activity := newActivity(t, app)
	start := time.Date(2026, 11, 18, 9, 0, 0, 0, time.UTC)
	block := newPlannedBlock(t, app, activity, start, start.Add(time.Hour))
	if err := app.Save(block); err != nil {
		t.Fatal(err)
	}

	if err := app.Delete(activity); err != nil {
		t.Fatalf("expected the activity deleted, got %v", err)
	}

	kept, err := app.FindRecordById(plannedBlocksCollection, block.Id)
	if err != nil {
		t.Fatalf("expected the block kept, got %v", err)
	}
	if kept.GetString("activity") != "" {
		t.Fatalf("expected the link cleared, got %q", kept.GetString("activity"))
	}
	if kept.GetString("label") != activity.GetString("name") {
		t.Fatalf("expected the label kept, got %q", kept.GetString("label"))
	}
}
