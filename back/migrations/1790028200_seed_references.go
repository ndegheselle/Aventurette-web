package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The referentials behind an activity's relation fields: the domains it covers, the imaginary
// universes it can be dressed in, the safety tags it carries, and the developmental keywords of
// each of the six axes. Reference data rather than schema, so it is seeded here instead of being
// typed into the Dashboard — and so a fresh database comes up usable.
//
// What is *not* here are the closed lists: environnement, saison, météo and niveau d'énergie are
// `select` columns on `activities`, so their values are part of the schema. Domaine is the one
// list meant to grow, which is why it is a collection and they are not.
//
// Every wording is stored per locale. `fr` is the app's fallback, so it is the one that has to
// be right; the English beside it is a first pass.
func init() {
	m.Register(func(app core.App) error {
		for _, referential := range referentials() {
			collection, err := app.FindCollectionByNameOrId(referential.collection)
			if err != nil {
				return err
			}

			for _, entry := range referential.entries {
				record := core.NewRecord(collection)
				record.Set("name", wording(entry.fr, entry.en))

				// Only a safety tag carries the other two: it is named by the referential and
				// stands for the precautions it lists.
				if entry.slug != "" {
					record.Set("slug", entry.slug)
					record.Set("description", wording(entry.aboutFR, entry.aboutEN))
				}

				if err := app.Save(record); err != nil {
					return err
				}
			}
		}

		return nil
	}, func(app core.App) error {
		// Matched on the French wording rather than wiped by collection: a referential someone
		// has since added to is not this migration's to empty.
		for _, referential := range referentials() {
			for _, entry := range referential.entries {
				records, err := app.FindRecordsByFilter(
					referential.collection,
					"name.fr = {:fr}",
					"",
					0,
					0,
					dbx.Params{"fr": entry.fr},
				)
				if err != nil {
					return err
				}

				for _, record := range records {
					if err := app.Delete(record); err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

// One row of a referential: its wording in both locales and, for a safety tag, the identifier
// the referential names it by and the precautions it stands for.
type seedEntry struct {
	fr, en           string
	slug             string
	aboutFR, aboutEN string
}

type seedReferential struct {
	collection string
	entries    []seedEntry
}

// wording is what a translated field holds: the locale, then the words.
func wording(fr string, en string) map[string]string {
	return map[string]string{"fr": fr, "en": en}
}

// words pairs up a flat list of fr, en, fr, en… — the shape every referential but Sécurité has.
func words(pairs ...string) []seedEntry {
	entries := make([]seedEntry, 0, len(pairs)/2)
	for i := 0; i+1 < len(pairs); i += 2 {
		entries = append(entries, seedEntry{fr: pairs[i], en: pairs[i+1]})
	}
	return entries
}

func referentials() []seedReferential {
	return []seedReferential{
		{
			// Domaine — what the activity is *about*. The one list meant to grow: a new domain
			// is a row here, unlike saison or météo, which are closed `select` values.
			collection: "activities_fields",
			entries: words(
				"art", "art",
				"ingénierie", "engineering",
				"motricité fine", "fine motor skills",
				"motricité globale", "gross motor skills",
				"imagination", "imagination",
				"langage", "language",
				"littérature", "literature",
				"logique/maths", "logic/maths",
				"musique", "music",
				"science", "science",
				"sensoriel", "sensory",
				"social", "social",
				"technologie", "technology",
				"cuisine", "cooking",
				"nature/environnement", "nature/environment",
				"eau", "water",
				"feu", "fire",
				"forêt/arbres", "forest/trees",
				"volcans", "volcanoes",
				"animaux", "animals",
				"vie pratique/autonomie", "practical life/independence",
				"théâtre/expression", "drama/expression",
				"stratégie", "strategy",
			),
		},
		{
			// Imaginaire — the narrative dress, not the subject. A word like "animaux" sits in
			// both referentials for that reason: studied here, worn there.
			collection: "activities_imaginary",
			entries: words(
				"pirates", "pirates",
				"princesses/chevaliers", "princesses/knights",
				"espace", "space",
				"dinosaures", "dinosaurs",
				"animaux", "animals",
				"fées", "fairies",
				"dragons", "dragons",
				"moyen-âge", "middle ages",
				"Chine", "China",
				"contes de fées", "fairy tales",
				"cirque", "circus",
				"super-héros", "superheroes",
			),
		},
		{collection: securityCollection, entries: securityTags()},
		{
			collection: "activities_develop_physical",
			entries: words(
				"motricité fine", "fine motor skills",
				"motricité globale", "gross motor skills",
				"équilibre", "balance",
				"dépense physique", "physical exertion",
			),
		},
		{
			collection: "activities_develop_intellectual",
			entries: words(
				"logique", "logic",
				"mémoire", "memory",
				"orientation", "orientation",
				"compter", "counting",
				"lettres", "letters",
				"formes", "shapes",
				"écriture", "writing",
			),
		},
		{
			collection: "activities_develop_affect",
			entries: words(
				"émotions", "emotions",
				"résilience", "resilience",
				"empathie", "empathy",
				"confiance en soi", "self-confidence",
			),
		},
		{
			collection: "activities_develop_social",
			entries: words(
				"coopération", "cooperation",
				"vivre-ensemble", "living together",
				"écoute", "listening",
				"faire connaissance", "getting to know each other",
				"prévention harcèlement", "bullying prevention",
				"décoder les préjugés", "decoding prejudice",
			),
		},
		{
			collection: "activities_develop_moral",
			entries: words(
				"autonomie", "independence",
				"créativité", "creativity",
				"agir", "taking action",
			),
		},
		{
			collection: "activities_develop_spiritual",
			entries: words(
				"contemplation", "contemplation",
				"méditation", "meditation",
				"émerveillement (nature, univers)", "wonder (nature, the universe)",
				"questionnement existentiel sur le sens de la vie", "existential questioning about the meaning of life",
			),
		},
	}
}

// The safety referential. A description holds the markup its field used to be an editor for, so
// a tag renders as the list of precautions it stands for.
func securityTags() []seedEntry {
	return []seedEntry{
		{
			fr: "Feu", en: "Fire", slug: "feu",
			aboutFR: precautions(
				"Toujours sous la supervision directe d'un animateur",
				"Zone dégagée, eau ou extincteur à proximité ; pas de feu par temps sec ou venteux sans autorisation",
				"Vérifier l'extinction complète en fin d'activité",
			),
			aboutEN: precautions(
				"Always under the direct supervision of a leader",
				"Clear area, water or an extinguisher within reach; no fire in dry or windy weather without authorisation",
				"Check that it is completely out at the end of the activity",
			),
		},
		{
			fr: "Eau (baignade, activités aquatiques)", en: "Water (swimming, water activities)", slug: "eau",
			aboutFR: precautions(
				"Surveillance renforcée, adaptée au niveau de natation de chaque enfant",
				"Vérifier la profondeur et le fond du plan d'eau avant l'activité",
				"Prévoir des équipements de flottaison si nécessaire",
			),
			aboutEN: precautions(
				"Closer supervision, matched to each child's swimming ability",
				"Check the depth and the bed of the water before the activity",
				"Provide flotation equipment where it is needed",
			),
		},
		{
			fr: "Objets tranchants ou pointus", en: "Sharp or pointed objects", slug: "tranchant",
			aboutFR: precautions(
				"Adapter l'outil à l'âge (ciseaux à bout rond pour les plus jeunes, etc.)",
				"Toujours sous supervision directe",
				"Ranger les outils immédiatement après usage",
			),
			aboutEN: precautions(
				"Match the tool to the age (round-ended scissors for the youngest, and so on)",
				"Always under direct supervision",
				"Put the tools away immediately after use",
			),
		},
		{
			fr: "Allergies et consignes alimentaires", en: "Allergies and dietary requirements", slug: "alimentaire",
			aboutFR: precautions(
				"Vérifier les allergies et régimes alimentaires du groupe avant toute activité cuisine ou dégustation",
				"Avoir les protocoles d'urgence (PAI) à disposition si besoin",
			),
			aboutEN: precautions(
				"Check the group's allergies and diets before any cooking or tasting activity",
				"Keep the emergency protocols (PAI) to hand if they are needed",
			),
		},
		{
			fr: "Météo extrême", en: "Extreme weather", slug: "meteo-extreme",
			aboutFR: precautions(
				"Chaleur : hydratation régulière, ombre, éviter les heures les plus chaudes",
				"Froid : vérifier les tenues, limiter le temps d'exposition",
				"Orage : arrêter immédiatement toute activité extérieure, se mettre à l'abri",
			),
			aboutEN: precautions(
				"Heat: drink regularly, stay in the shade, avoid the hottest hours",
				"Cold: check what everyone is wearing, limit the time spent outside",
				"Storm: stop every outdoor activity at once and take shelter",
			),
		},
		{
			fr: "Premiers secours", en: "First aid", slug: "premiers-secours",
			aboutFR: precautions(
				"Trousse de premiers secours accessible sur le lieu de l'activité",
				"Un animateur formé (PSC1 ou équivalent) identifié avant le début",
			),
			aboutEN: precautions(
				"A first aid kit within reach at the activity site",
				"A trained leader (PSC1 or equivalent) identified before the start",
			),
		},
	}
}

// precautions renders a tag's rules as the list they read as.
func precautions(rules ...string) string {
	markup := "<ul>"
	for _, rule := range rules {
		markup += "<li>" + rule + "</li>"
	}
	return markup + "</ul>"
}
