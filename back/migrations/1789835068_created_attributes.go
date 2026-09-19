package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

// The attribute catalogue: groups, the attributes each group defines, their controlled
// vocabularies, and what one activity holds for them. Written by hand rather than generated
// from the Dashboard, so the five collections and their relations land in one step.
//
// Reference data is public to read and superuser-only to write; the value collections follow
// `activities_steps` and are open, because the editor writes them from the client.
func init() {
	m.Register(func(app core.App) error {
		activities, err := app.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}

		groups := core.NewBaseCollection("groups")
		groups.ListRule = types.Pointer("")
		groups.ViewRule = types.Pointer("")
		groups.Fields.Add(withTimestamps(
			&core.TextField{Name: "name", Required: true, Presentable: true},
			&core.TextField{Name: "slug", Required: true, Pattern: `^[a-z0-9-]+$`},
		)...)
		groups.Indexes = types.JSONArray[string]{
			"CREATE UNIQUE INDEX `idx_groups_slug` ON `groups` (`slug`)",
		}
		if err := app.Save(groups); err != nil {
			return err
		}

		definitions := core.NewBaseCollection("attribute_definitions")
		definitions.ListRule = types.Pointer("")
		definitions.ViewRule = types.Pointer("")
		definitions.Fields.Add(withTimestamps(
			&core.RelationField{
				Name:          "group",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  groups.Id,
				CascadeDelete: true,
			},
			&core.TextField{Name: "name", Required: true, Presentable: true},
			&core.TextField{Name: "slug", Required: true, Pattern: `^[a-z0-9-]+$`},
			&core.SelectField{
				Name:      "type",
				Required:  true,
				MaxSelect: 1,
				Values:    []string{"string", "number", "range", "single_choice", "multi_choice"},
			},
			&core.BoolField{Name: "required"},
			&core.BoolField{Name: "filterable"},
			&core.NumberField{Name: "sort_order", OnlyInt: true},
		)...)
		definitions.Indexes = types.JSONArray[string]{
			"CREATE UNIQUE INDEX `idx_attribute_definitions_slug` ON `attribute_definitions` (`slug`)",
			"CREATE INDEX `idx_attribute_definitions_group` ON `attribute_definitions` (`group`, `sort_order`)",
		}
		if err := app.Save(definitions); err != nil {
			return err
		}

		options := core.NewBaseCollection("attribute_options")
		options.ListRule = types.Pointer("")
		options.ViewRule = types.Pointer("")
		options.Fields.Add(withTimestamps(
			&core.RelationField{
				Name:          "attribute",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  definitions.Id,
				CascadeDelete: true,
			},
			&core.TextField{Name: "label", Required: true, Presentable: true},
			&core.TextField{Name: "value", Required: true},
			// Which family an option belongs to under one attribute — the Imaginaire
			// sub-groups, kept as option metadata rather than as their own groups.
			&core.TextField{Name: "subgroup"},
			&core.NumberField{Name: "sort_order", OnlyInt: true},
		)...)
		options.Indexes = types.JSONArray[string]{
			"CREATE UNIQUE INDEX `idx_attribute_options_value` ON `attribute_options` (`attribute`, `value`)",
			"CREATE INDEX `idx_attribute_options_attribute` ON `attribute_options` (`attribute`, `sort_order`)",
		}
		if err := app.Save(options); err != nil {
			return err
		}

		values := core.NewBaseCollection("activity_attribute_values")
		values.ListRule = types.Pointer("")
		values.ViewRule = types.Pointer("")
		values.CreateRule = types.Pointer("")
		values.UpdateRule = types.Pointer("")
		values.DeleteRule = types.Pointer("")
		values.Fields.Add(withTimestamps(
			&core.RelationField{
				Name:          "activity",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  activities.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:          "attribute",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  definitions.Id,
				CascadeDelete: true,
			},
			&core.TextField{Name: "string_value"},
			&core.NumberField{Name: "number_value"},
			&core.NumberField{Name: "range_min"},
			&core.NumberField{Name: "range_max"},
			// The single_choice pick. Several of them are rows of
			// `activity_attribute_options` instead.
			&core.RelationField{
				Name:         "option",
				MaxSelect:    1,
				CollectionId: options.Id,
			},
		)...)
		// One row per activity and attribute: what lets a filter count the attributes an
		// activity matched rather than the rows it produced.
		values.Indexes = types.JSONArray[string]{
			"CREATE UNIQUE INDEX `idx_activity_attribute_values_pair` ON `activity_attribute_values` (`activity`, `attribute`)",
			"CREATE INDEX `idx_activity_attribute_values_attribute` ON `activity_attribute_values` (`attribute`)",
		}
		if err := app.Save(values); err != nil {
			return err
		}

		picks := core.NewBaseCollection("activity_attribute_options")
		picks.ListRule = types.Pointer("")
		picks.ViewRule = types.Pointer("")
		picks.CreateRule = types.Pointer("")
		picks.UpdateRule = types.Pointer("")
		picks.DeleteRule = types.Pointer("")
		picks.Fields.Add(withTimestamps(
			&core.RelationField{
				Name:          "activity",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  activities.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:          "attribute",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  definitions.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:          "option",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  options.Id,
				CascadeDelete: true,
			},
		)...)
		picks.Indexes = types.JSONArray[string]{
			"CREATE UNIQUE INDEX `idx_activity_attribute_options_pick` ON `activity_attribute_options` (`activity`, `attribute`, `option`)",
			"CREATE INDEX `idx_activity_attribute_options_option` ON `activity_attribute_options` (`option`)",
		}

		return app.Save(picks)
	}, func(app core.App) error {
		// Reverse order: a collection cannot go while another still relates to it.
		for _, name := range []string{
			"activity_attribute_options",
			"activity_attribute_values",
			"attribute_options",
			"attribute_definitions",
			"groups",
		} {
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

// The given fields, followed by the two autodate fields every collection here carries.
func withTimestamps(fields ...core.Field) []core.Field {
	return append(fields,
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
}
