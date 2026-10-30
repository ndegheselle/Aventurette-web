package hooks

import (
	"testing"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

// An activity owned by a fresh user, with no step yet.
func newActivity(t *testing.T, app *tests.TestApp) *core.Record {
	users, err := app.FindCollectionByNameOrId(usersCollection)
	if err != nil {
		t.Fatal(err)
	}
	user := core.NewRecord(users)
	user.SetEmail("author@test.local")
	user.SetPassword("Passw0rd1234")
	if err := app.Save(user); err != nil {
		t.Fatal(err)
	}

	activities, err := app.FindCollectionByNameOrId(activitiesCollection)
	if err != nil {
		t.Fatal(err)
	}
	activity := core.NewRecord(activities)
	activity.Set("name", "Relais")
	activity.Set("state", "DRAFT")
	activity.Set("user", user.Id)
	if err := app.Save(activity); err != nil {
		t.Fatal(err)
	}
	return activity
}

func newStep(t *testing.T, app *tests.TestApp, activity *core.Record, minutes int) *core.Record {
	steps, err := app.FindCollectionByNameOrId(stepsCollection)
	if err != nil {
		t.Fatal(err)
	}
	step := core.NewRecord(steps)
	step.Set("activity", activity.Id)
	step.Set("kind", "CUSTOM")
	step.Set("description", "<p>Courir</p>")
	step.Set("duration", minutes)
	if err := app.Save(step); err != nil {
		t.Fatal(err)
	}
	return step
}

func durationOf(t *testing.T, app *tests.TestApp, activity *core.Record) int {
	stored, err := app.FindRecordById(activitiesCollection, activity.Id)
	if err != nil {
		t.Fatal(err)
	}
	return stored.GetInt("duration")
}

func TestActivityDurationFollowsItsSteps(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	activity := newActivity(t, app)
	first := newStep(t, app, activity, 10)
	newStep(t, app, activity, 25)
	if got := durationOf(t, app, activity); got != 35 {
		t.Fatalf("after two steps, expected 35, got %d", got)
	}

	first.Set("duration", 15)
	if err := app.Save(first); err != nil {
		t.Fatal(err)
	}
	if got := durationOf(t, app, activity); got != 40 {
		t.Fatalf("after a step changed, expected 40, got %d", got)
	}

	if err := app.Delete(first); err != nil {
		t.Fatal(err)
	}
	if got := durationOf(t, app, activity); got != 25 {
		t.Fatalf("after a step was deleted, expected 25, got %d", got)
	}
}

func TestActivityDurationIgnoresWhatAClientSends(t *testing.T) {
	app := newTestApp(t)
	defer app.Cleanup()

	activity := newActivity(t, app)
	newStep(t, app, activity, 20)

	activity.Set("duration", 999)
	if err := app.Save(activity); err != nil {
		t.Fatal(err)
	}
	if got := durationOf(t, app, activity); got != 20 {
		t.Fatalf("expected the steps' 20, got %d", got)
	}
}
