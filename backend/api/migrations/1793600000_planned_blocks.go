package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// `planned_blocks` replaces `user_planned_activities`: a block of a user's planning is a label
// from one moment to another, and may point at the activity it runs.
//
// Everything is set when the block is planned and kept, as the length already was: the label is
// the activity's name at that time, and renaming the activity does not change it. Deleting the
// activity keeps the block and only clears the link, so `activity` is optional and does not
// cascade.
//
// The records already there are copied, with their activity's name as their label. The rollback
// copies back only the blocks that still point at an activity.
const copyPlannedActivitiesQuery = `INSERT INTO planned_blocks (id, "user", activity, label, start, "end", created, updated)
SELECT planned.id, planned."user", planned.activity, activities.name, planned.start, planned."end", planned.created, planned.updated
FROM user_planned_activities planned JOIN activities ON activities.id = planned.activity`

const copyBlocksBackQuery = `INSERT INTO user_planned_activities (id, "user", activity, start, "end", created, updated)
SELECT id, "user", activity, start, "end", created, updated
FROM planned_blocks WHERE activity != ''`

func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		blocks := core.NewBaseCollection("planned_blocks")
		setOwnRules(blocks)
		blocks.Fields.Add(
			&core.RelationField{Name: "user", CollectionId: "_pb_users_auth_", MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.RelationField{Name: "activity", CollectionId: activities.Id, MaxSelect: 1},
			&core.TextField{Name: "label", Required: true, Max: 200},
			&core.DateField{Name: "start", Required: true},
			&core.DateField{Name: "end", Required: true},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		// The calendar reads one user's planning over a range of dates.
		blocks.AddIndex("idx_planned_blocks_user_start", false, "`user`, `start`", "")
		if err := app.Save(blocks); err != nil {
			return err
		}

		if _, err := app.DB().NewQuery(copyPlannedActivitiesQuery).Execute(); err != nil {
			return err
		}

		planned, err := app.FindCollectionByNameOrId("user_planned_activities")
		if err != nil {
			return err
		}
		return app.Delete(planned)
	}, func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		planned := core.NewBaseCollection("user_planned_activities")
		setOwnRules(planned)
		planned.Fields.Add(
			&core.RelationField{Name: "user", CollectionId: "_pb_users_auth_", MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.RelationField{Name: "activity", CollectionId: activities.Id, MaxSelect: 1, Required: true, CascadeDelete: true},
			&core.DateField{Name: "start", Required: true},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
			&core.DateField{Name: "end", Required: true},
		)
		planned.AddIndex("idx_user_planned_activities_user_start", false, "`user`, `start`", "")
		if err := app.Save(planned); err != nil {
			return err
		}

		if _, err := app.DB().NewQuery(copyBlocksBackQuery).Execute(); err != nil {
			return err
		}

		blocks, err := app.FindCollectionByNameOrId("planned_blocks")
		if err != nil {
			return err
		}
		return app.Delete(blocks)
	})
}

// setOwnRules lets each user read and write their own records, and nobody else's.
func setOwnRules(collection *core.Collection) {
	ownRule := "user = @request.auth.id"
	createRule := "@request.body.user = @request.auth.id"
	updateRule := ownRule + " && @request.body.user:changed = false"
	collection.ListRule, collection.ViewRule = &ownRule, &ownRule
	collection.CreateRule, collection.UpdateRule, collection.DeleteRule = &createRule, &updateRule, &ownRule
}
