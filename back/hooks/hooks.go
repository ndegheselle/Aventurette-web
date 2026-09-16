package hooks

import (
	"database/sql"
	"errors"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

const stepsCollection = "activities_steps"

// What a step owns: the field listing them, and the collection they live in. The editor keeps
// both as a list on the step, so dropping an id from that list is what says it is unneeded.
var stepChildren = map[string]string{
	"resources": "steps_resources",
	"materials": "steps_materials",
}

// Register binds every application hook. Called once from main.
func Register(app core.App) {
	registerStepChildrenCleanup(app)
}

// registerStepChildrenCleanup deletes a step's resources and materials once no step points at
// them. The editor only ever unlinks: `activities_steps.resources` and `.materials` cascade, so
// deleting from the client would take the step down with the last of its children.
func registerStepChildrenCleanup(app core.App) {
	app.OnRecordUpdate(stepsCollection).BindFunc(func(e *core.RecordEvent) error {
		previous := make(map[string][]string, len(stepChildren))
		for field := range stepChildren {
			previous[field] = e.Record.Original().GetStringSlice(field)
		}

		if err := e.Next(); err != nil {
			return err
		}

		for field, collection := range stepChildren {
			if err := deleteUnreferenced(e.App, field, collection, previous[field]); err != nil {
				return err
			}
		}

		return nil
	})
}

// deleteUnreferenced removes each of the given records that no step links to any more.
func deleteUnreferenced(app core.App, field string, collection string, ids []string) error {
	for _, id := range ids {
		// "<field>.id ?=" and not "<field> ?=": on a multi-relation the bare field name
		// compares against the whole stored list and matches nothing.
		referencing, err := app.FindRecordsByFilter(
			stepsCollection,
			field+".id ?= {:id}",
			"",
			1,
			0,
			dbx.Params{"id": id},
		)
		if err != nil {
			return err
		}
		if len(referencing) > 0 {
			continue
		}

		record, err := app.FindRecordById(collection, id)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue // already gone, nothing to reclaim
			}
			return err
		}

		if err := app.Delete(record); err != nil {
			return err
		}
	}

	return nil
}
