package hooks

import (
	"database/sql"
	"errors"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

const (
	stepsCollection     = "activities_steps"
	resourcesCollection = "activities_resources"
	resourcesField      = "resources"
)

// Register binds every application hook. Called once from main.
func Register(app core.App) {
	registerResourceCleanup(app)
}

// registerResourceCleanup deletes an activity resource once no step points at it any more.
func registerResourceCleanup(app core.App) {
	app.OnRecordUpdate(stepsCollection).BindFunc(func(e *core.RecordEvent) error {
		previous := e.Record.Original().GetStringSlice(resourcesField)

		if err := e.Next(); err != nil {
			return err
		}

		return deleteUnreferenced(e.App, previous)
	})
}

// deleteUnreferenced removes each of the given resources that no step links to any more.
func deleteUnreferenced(app core.App, ids []string) error {
	for _, id := range ids {
		// "resources.id ?=" and not "resources ?=": on a multi-relation the bare field name
		// compares against the whole stored list and matches nothing.
		referencing, err := app.FindRecordsByFilter(
			stepsCollection,
			resourcesField+".id ?= {:id}",
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

		resource, err := app.FindRecordById(resourcesCollection, id)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue // already gone, nothing to reclaim
			}
			return err
		}

		if err := app.Delete(resource); err != nil {
			return err
		}
	}

	return nil
}
