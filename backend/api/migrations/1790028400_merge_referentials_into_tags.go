package migrations

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Folds the nine referentials into `activities_tags`, told apart by `type`, and their nine
// relation fields on `activities` into one `tags` field. Record ids are kept, so links carry over
// as they are. See docs/adr/0014-activity-tags-are-one-collection.md.
func init() {
	m.Register(mergeReferentialsIntoTags, splitTagsIntoReferentials)
}

const (
	tagsCollection = "activities_tags"
	tagsField      = "tags"
)

// A referential as it stood before the merge; ids are the ones the snapshot gave it, so a
// rollback restores the same collections and fields.
type legacyReferential struct {
	tagType        string
	collection     string
	collectionId   string
	relation       string
	relationId     string
	optionalName   bool
	hasDescription bool
}

func legacyReferentials() []legacyReferential {
	return []legacyReferential{
		{tagType: "FIELD", collection: "activities_fields", collectionId: "pbc_4231066068", relation: "fields", relationId: "relation2128995208", optionalName: true},
		{tagType: "IMAGINARY", collection: "activities_imaginary", collectionId: "pbc_3168962977", relation: "imaginary", relationId: "relation1460209791"},
		{tagType: "SECURITY", collection: "activities_security", collectionId: "pbc_539767812", relation: "security", relationId: "relation3315324353", hasDescription: true},
		{tagType: "DEVELOP_PHYSICAL", collection: "activities_develop_physical", collectionId: "pbc_112511032", relation: "develop_physical", relationId: "relation1994278826"},
		{tagType: "DEVELOP_INTELLECTUAL", collection: "activities_develop_intellectual", collectionId: "pbc_2556553961", relation: "develop_intellectual", relationId: "relation2857790826"},
		{tagType: "DEVELOP_AFFECT", collection: "activities_develop_affect", collectionId: "pbc_932243895", relation: "develop_affect", relationId: "relation270393044"},
		{tagType: "DEVELOP_SOCIAL", collection: "activities_develop_social", collectionId: "pbc_4254783606", relation: "develop_social", relationId: "relation3823845521"},
		{tagType: "DEVELOP_MORAL", collection: "activities_develop_moral", collectionId: "pbc_870588848", relation: "develop_moral", relationId: "relation2680852346"},
		{tagType: "DEVELOP_SPIRITUAL", collection: "activities_develop_spiritual", collectionId: "pbc_3877408095", relation: "develop_spritual", relationId: "relation1445969280"},
	}
}

func mergeReferentialsIntoTags(app core.App) error {
	referentials := legacyReferentials()

	types := make([]string, 0, len(referentials))
	for _, referential := range referentials {
		types = append(types, referential.tagType)
	}

	tags := core.NewBaseCollection(tagsCollection)
	tags.ListRule = pointer("")
	tags.ViewRule = pointer("")
	tags.Fields.Add(
		&core.SelectField{Name: "type", Required: true, MaxSelect: 1, Values: types},
		&core.TextField{Name: "slug", Required: true, Pattern: `^[a-z0-9-]+$`},
		&core.JSONField{Name: "name", Required: true},
		&core.JSONField{Name: "description"},
		&core.AutodateField{Name: "created", OnCreate: true},
		&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
	)
	tags.AddIndex("idx_activities_tags_type_slug", true, "`type`, `slug`", "")

	if err := app.Save(tags); err != nil {
		return err
	}

	for _, referential := range referentials {
		records, err := app.FindAllRecords(referential.collection)
		if err != nil {
			return fmt.Errorf("collection %s: %w", referential.collection, err)
		}

		for _, old := range records {
			tag := core.NewRecord(tags)
			tag.Id = old.Id
			tag.Set("type", referential.tagType)
			tag.Set("name", old.Get("name"))

			if referential.hasDescription {
				tag.Set("slug", old.GetString("slug"))
				tag.Set("description", old.Get("description"))
			} else {
				tag.Set("slug", slugify(frenchName(old)))
			}

			if err := app.Save(tag); err != nil {
				return fmt.Errorf("%s %s: %w", referential.collection, old.Id, err)
			}
		}
	}

	activities, err := app.FindCollectionByNameOrId("activities")
	if err != nil {
		return err
	}

	activities.Fields.Add(&core.RelationField{Name: tagsField, CollectionId: tags.Id, MaxSelect: 999})
	if err := app.Save(activities); err != nil {
		return err
	}

	records, err := app.FindAllRecords(activities)
	if err != nil {
		return err
	}

	for _, activity := range records {
		var ids []string
		for _, referential := range referentials {
			ids = append(ids, activity.GetStringSlice(referential.relation)...)
		}

		activity.Set(tagsField, ids)

		// Without validation: an older draft breaking an unrelated rule must not block the move.
		if err := app.SaveNoValidate(activity); err != nil {
			return err
		}
	}

	for _, referential := range referentials {
		activities.Fields.RemoveByName(referential.relation)
	}
	if err := app.Save(activities); err != nil {
		return err
	}

	for _, referential := range referentials {
		collection, err := app.FindCollectionByNameOrId(referential.collection)
		if err != nil {
			return err
		}
		if err := app.Delete(collection); err != nil {
			return err
		}
	}

	return nil
}

func splitTagsIntoReferentials(app core.App) error {
	referentials := legacyReferentials()

	collections := make(map[string]*core.Collection, len(referentials))
	for _, referential := range referentials {
		collection := core.NewBaseCollection(referential.collection, referential.collectionId)
		collection.ListRule = pointer("")
		collection.ViewRule = pointer("")
		collection.Fields.Add(&core.JSONField{Name: "name", Required: !referential.optionalName})
		if referential.hasDescription {
			collection.Fields.Add(
				&core.JSONField{Name: "description"},
				&core.TextField{Name: "slug", Required: true, Pattern: `^[a-z0-9-]+$`},
			)
		}
		collection.Fields.Add(
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)

		if err := app.Save(collection); err != nil {
			return err
		}
		collections[referential.tagType] = collection
	}

	tags, err := app.FindAllRecords(tagsCollection)
	if err != nil {
		return err
	}

	for _, tag := range tags {
		tagType := tag.GetString("type")
		collection, ok := collections[tagType]
		if !ok {
			return fmt.Errorf("tag %s: no referential for type %q", tag.Id, tagType)
		}

		record := core.NewRecord(collection)
		record.Id = tag.Id
		record.Set("name", tag.Get("name"))
		if tagType == "SECURITY" {
			record.Set("slug", tag.GetString("slug"))
			record.Set("description", tag.Get("description"))
		}

		if err := app.Save(record); err != nil {
			return err
		}
	}

	activities, err := app.FindCollectionByNameOrId("activities")
	if err != nil {
		return err
	}

	for _, referential := range referentials {
		activities.Fields.Add(&core.RelationField{
			Id:           referential.relationId,
			Name:         referential.relation,
			CollectionId: referential.collectionId,
			MaxSelect:    10,
		})
	}
	if err := app.Save(activities); err != nil {
		return err
	}

	typeOf := make(map[string]string, len(tags))
	for _, tag := range tags {
		typeOf[tag.Id] = tag.GetString("type")
	}

	records, err := app.FindAllRecords(activities)
	if err != nil {
		return err
	}

	for _, activity := range records {
		byType := map[string][]string{}
		for _, id := range activity.GetStringSlice(tagsField) {
			byType[typeOf[id]] = append(byType[typeOf[id]], id)
		}

		for _, referential := range referentials {
			activity.Set(referential.relation, byType[referential.tagType])
		}

		if err := app.SaveNoValidate(activity); err != nil {
			return err
		}
	}

	activities.Fields.RemoveByName(tagsField)
	if err := app.Save(activities); err != nil {
		return err
	}

	collection, err := app.FindCollectionByNameOrId(tagsCollection)
	if err != nil {
		return err
	}

	return app.Delete(collection)
}

// frenchName reads the `fr` wording of a translated `name`, the one every referential row has.
func frenchName(record *core.Record) string {
	var name map[string]string
	if err := record.UnmarshalJSONField("name", &name); err != nil {
		return ""
	}

	return name["fr"]
}

var (
	accents    = strings.NewReplacer("à", "a", "â", "a", "ä", "a", "é", "e", "è", "e", "ê", "e", "ë", "e", "î", "i", "ï", "i", "ô", "o", "ö", "o", "ù", "u", "û", "u", "ü", "u", "ç", "c", "œ", "oe", "æ", "ae")
	nonSlugRun = regexp.MustCompile(`[^a-z0-9]+`)
)

// slugify turns a French wording into a slug: "forêt/arbres" becomes "foret-arbres".
func slugify(words string) string {
	return strings.Trim(nonSlugRun.ReplaceAllString(accents.Replace(strings.ToLower(words)), "-"), "-")
}
