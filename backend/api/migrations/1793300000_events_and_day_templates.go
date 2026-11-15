package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The planning's two collections.
//
// `events` holds a dated programme: a name, from one moment to another, a place, whether there
// is a night, the group it is for, and how far along it is. Its owner reads and writes it, and
// nobody else: who sees a shared event is not decided yet.
//
// `day_templates` holds a reusable day: a name, a line saying what is in it, and its times. One
// with no owner is Ajil's: everybody reads it, an admin writes it. One with an owner is that
// user's own. A structure's templates wait for structures.
//
// Groups do not exist yet: an event names its group as text.
func init() {
	m.Register(func(app core.App) error {
		events := core.NewBaseCollection("events")

		ownRule := "owner = @request.auth.id"
		createRule := "@request.body.owner = @request.auth.id"
		updateRule := ownRule + " && @request.body.owner:changed = false"
		events.ListRule, events.ViewRule = &ownRule, &ownRule
		events.CreateRule, events.UpdateRule, events.DeleteRule = &createRule, &updateRule, &ownRule

		events.Fields.Add(
			&core.RelationField{Name: "owner", CollectionId: "_pb_users_auth_", MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.TextField{Name: "name", Required: true, Max: 200},
			&core.DateField{Name: "start", Required: true},
			&core.DateField{Name: "end", Required: true},
			&core.TextField{Name: "place", Max: 200},
			&core.BoolField{Name: "overnight"},
			&core.TextField{Name: "group", Max: 200},
			&core.SelectField{Name: "status", MaxSelect: 1, Values: []string{"DRAFT", "PREPARING", "READY"}},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		// The calendar reads one user's events over a range of dates.
		events.AddIndex("idx_events_owner_start", false, "`owner`, `start`", "")

		if err := app.Save(events); err != nil {
			return err
		}

		templates := core.NewBaseCollection("day_templates")

		readRule := `owner = "" || owner = @request.auth.id`
		writeRule := "(" + ownRule + " && @request.body.owner:changed = false) || " + adminWriteRule
		createTemplateRule := createRule + " || " + adminWriteRule
		templates.ListRule, templates.ViewRule = &readRule, &readRule
		templates.CreateRule, templates.UpdateRule = &createTemplateRule, &writeRule
		deleteTemplateRule := ownRule + " || " + adminWriteRule
		templates.DeleteRule = &deleteTemplateRule

		templates.Fields.Add(
			&core.RelationField{Name: "owner", CollectionId: "_pb_users_auth_", MaxSelect: 1, CascadeDelete: true},
			&core.TextField{Name: "name", Required: true, Max: 200},
			&core.TextField{Name: "summary", Max: 500},
			// Minutes since midnight; 0 is unset, as for every number the app reads.
			&core.NumberField{Name: "startMinutes", OnlyInt: true},
			&core.NumberField{Name: "endMinutes", OnlyInt: true},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)

		return app.Save(templates)
	}, func(app core.App) error {
		for _, name := range []string{"day_templates", "events"} {
			collection, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				return err
			}
			if err := app.Delete(collection); err != nil {
				return err
			}
		}
		return nil
	})
}
