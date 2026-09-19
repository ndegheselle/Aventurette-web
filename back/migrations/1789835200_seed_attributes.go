package migrations

import (
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The initial catalogue: the eight groups of the Glossaire, the attributes each one defines and
// their controlled vocabularies. Reference data rather than schema, so it is seeded here instead
// of being typed into the Dashboard — and so a fresh database comes up filterable.
//
// Slugs are derived from the labels, except for the attributes, which name their own: the front
// keys off an attribute's slug, and "temps-jeu" is a better key than "temps-de-jeu-activite".
func init() {
	m.Register(func(app core.App) error {
		groups, err := app.FindCollectionByNameOrId("groups")
		if err != nil {
			return err
		}
		definitions, err := app.FindCollectionByNameOrId("attribute_definitions")
		if err != nil {
			return err
		}
		options, err := app.FindCollectionByNameOrId("attribute_options")
		if err != nil {
			return err
		}

		for _, group := range catalogue() {
			groupRecord := core.NewRecord(groups)
			groupRecord.Set("name", group.name)
			groupRecord.Set("slug", slugify(group.name))
			if err := app.Save(groupRecord); err != nil {
				return err
			}

			for attributeIndex, attribute := range group.attributes {
				definitionRecord := core.NewRecord(definitions)
				definitionRecord.Set("group", groupRecord.Id)
				definitionRecord.Set("name", attribute.name)
				definitionRecord.Set("slug", attribute.slug)
				definitionRecord.Set("type", attribute.kind)
				definitionRecord.Set("filterable", attribute.filterable)
				definitionRecord.Set("sort_order", attributeIndex+1)
				if err := app.Save(definitionRecord); err != nil {
					return err
				}

				for optionIndex, option := range attribute.options {
					value := option.value
					if value == "" {
						value = slugify(option.label)
					}

					optionRecord := core.NewRecord(options)
					optionRecord.Set("attribute", definitionRecord.Id)
					optionRecord.Set("label", option.label)
					optionRecord.Set("value", value)
					optionRecord.Set("subgroup", option.subgroup)
					optionRecord.Set("sort_order", optionIndex+1)
					if err := app.Save(optionRecord); err != nil {
						return err
					}
				}
			}
		}

		return nil
	}, func(app core.App) error {
		// Definitions and options cascade from their group, so the groups are all that go.
		for _, group := range catalogue() {
			record, err := app.FindFirstRecordByData("groups", "slug", slugify(group.name))
			if err != nil {
				continue // never seeded, or already gone
			}
			if err := app.Delete(record); err != nil {
				return err
			}
		}

		return nil
	})
}

type seedOption struct {
	label string
	// Derived from the label when empty. Set it where the stored value is not the wording —
	// an energy level is 1, 2, 3 whatever it is called.
	value    string
	subgroup string
}

type seedAttribute struct {
	name       string
	slug       string
	kind       string
	filterable bool
	options    []seedOption
}

type seedGroup struct {
	name       string
	attributes []seedAttribute
}

// labelled turns a list of wordings into options, each taking its value from its label.
func labelled(labels ...string) []seedOption {
	seeds := make([]seedOption, 0, len(labels))
	for _, label := range labels {
		seeds = append(seeds, seedOption{label: label})
	}
	return seeds
}

// grouped does the same for one family of Imaginaire options.
func grouped(subgroup string, labels ...string) []seedOption {
	seeds := labelled(labels...)
	for i := range seeds {
		seeds[i].subgroup = subgroup
	}
	return seeds
}

// development is the shape every developmental group shares: one multi_choice attribute named
// after its group, holding the group's keywords.
func development(name string, slug string, labels ...string) seedGroup {
	return seedGroup{
		name: name,
		attributes: []seedAttribute{
			{name: name, slug: slug, kind: "multi_choice", filterable: true, options: labelled(labels...)},
		},
	}
}

func catalogue() []seedGroup {
	return []seedGroup{
		{
			name: "Général",
			attributes: []seedAttribute{
				{
					name: "Environnement / localisation", slug: "environnement",
					kind: "multi_choice", filterable: true,
					options: labelled(
						"parc de jeux", "maison", "balcon", "voiture", "extérieur", "ville",
						"campagne", "forêt", "montagne", "piscine", "lac", "rivière", "bain",
						"repas",
					),
				},
				{name: "Âge recommandé", slug: "age", kind: "range", filterable: true},
				{name: "Nombre d'enfants recommandé", slug: "nombre-enfants", kind: "range", filterable: true},
				{name: "Nombre d'animateurs", slug: "nombre-animateurs", kind: "number", filterable: true},
				{name: "Temps de préparation", slug: "temps-preparation", kind: "number", filterable: true},
				{name: "Temps de jeu / activité", slug: "temps-jeu", kind: "number", filterable: true},
				{
					name: "Domaine", slug: "domaine",
					kind: "multi_choice", filterable: true,
					options: labelled(
						"art", "ingénierie", "motricité fine", "motricité globale", "imagination",
						"langage", "littérature", "logique/maths", "musique", "science",
						"sensoriel", "social", "technologie", "cuisine", "nature/environnement",
						"eau", "feu", "forêt/arbres", "volcans", "animaux",
						"vie pratique/autonomie", "théâtre/expression", "stratégie",
					),
				},
				{
					name: "Saison", slug: "saison",
					kind: "multi_choice", filterable: true,
					options: labelled(
						"automne", "hiver", "printemps", "été", "Noël", "Nouvel An", "Halloween",
						"Saint-Valentin", "Pâques",
					),
				},
				{
					name: "Météo", slug: "meteo",
					kind: "multi_choice", filterable: true,
					options: labelled("jour de pluie", "jour de neige", "beau temps", "venteux"),
				},
				{
					name: "Niveau d'énergie", slug: "niveau-energie",
					kind: "single_choice", filterable: true,
					options: []seedOption{
						{label: "Bas", value: "1"},
						{label: "Correct / moyen", value: "2"},
						{label: "Au top", value: "3"},
					},
				},
				// Its vocabulary is the Sécurité page's tag referential, which is not ours yet.
				{name: "Sécurité", slug: "securite", kind: "multi_choice", filterable: true},
				{name: "Visuel principal", slug: "visuel-principal", kind: "string"},
			},
		},
		{
			name: "Imaginaire",
			attributes: []seedAttribute{
				{
					name: "Imaginaire", slug: "imaginaire",
					kind: "multi_choice", filterable: true,
					options: concat(
						grouped("Fantastique / contes de fées", "fées", "dragons", "contes de fées", "princesses/chevaliers"),
						grouped("Super-héros", "super-héros"),
						grouped("Historique", "moyen-âge", "Chine"),
						grouped("Science-fiction / espace", "espace"),
						grouped("Aventure", "pirates"),
						grouped("Monde animal", "animaux", "dinosaures"),
						grouped("Fête et spectacle", "cirque"),
						grouped("Histoire précise", "Les Chaudoudoux"),
					),
				},
			},
		},
		development("Développement physique", "developpement-physique",
			"dépassement de soi", "contrôle du geste", "coordination corporelle",
			"dépense physique", "équilibre", "expression corporelle", "respiration",
			"gestion de l'espace", "débrouillardise", "habileté manuelle",
			"adaptation aux conditions extérieures", "goût du risque maîtrisé",
			"connaissance de ses limites corporelles", "réguler son énergie",
		),
		development("Développement intellectuel", "developpement-intellectuel",
			"argumenter", "débattre", "déduction", "faire des liens", "logique", "observation",
			"réflexion", "curiosité", "esprit critique", "sens de l'orientation", "planification",
			"pensée stratégique",
		),
		development("Développement affectif", "developpement-affectif",
			"confiance en soi", "confiance et connexion", "émerveillement",
			"exprimer ses émotions", "gestion des émotions", "identifier ses émotions",
			"mieux se connaître", "fierté", "délicatesse envers autrui", "empathie",
			"résilience émotionnelle", "sécurité affective", "respect de l'intimité",
			"oser essayer",
		),
		development("Développement social", "developpement-social",
			"coopérer", "débattre", "écoute", "écouter les avis divergents", "exclusion",
			"renforcer les liens du groupe", "vivre-ensemble", "communication",
			"complémentarité", "connaissance des autres", "différence",
			"confiance mutuelle en équipe", "sens des responsabilités partagées",
			"participation démocratique", "médiation entre pairs", "entraide",
			"rencontre interculturelle", "prise d'initiative", "fédérer une équipe",
			"conduite de projet",
		),
		development("Développement moral / caractère", "developpement-moral",
			"autonomie", "courage", "créativité", "écocitoyenneté", "patience", "valeurs",
			"stéréotypes et préjugés", "respecter les avis divergents", "discrimination",
			"égalité des chances", "engagement", "ouverture d'esprit", "prise de position",
			"intégrité", "persévérance", "droit à l'erreur", "gratitude", "pardon", "sobriété",
			"générosité", "sens de la justice", "suivre une consigne",
		),
		development("Développement spirituel", "developpement-spirituel",
			"connexion au monde", "contemplation", "émerveillement face à la nature",
			"questionnement existentiel", "scoutisme (Loi et Promesse)", "sérénité", "espérance",
			"intériorité", "sens du rite et du symbole", "ouverture aux convictions d'autrui",
			"don de soi",
		),
	}
}

func concat(lists ...[]seedOption) []seedOption {
	var all []seedOption
	for _, list := range lists {
		all = append(all, list...)
	}
	return all
}

var accents = strings.NewReplacer(
	"à", "a", "â", "a", "ä", "a",
	"é", "e", "è", "e", "ê", "e", "ë", "e",
	"î", "i", "ï", "i",
	"ô", "o", "ö", "o",
	"ù", "u", "û", "u", "ü", "u",
	"ç", "c", "œ", "oe", "æ", "ae",
)

// slugify reduces a wording to the `^[a-z0-9-]+$` a slug field accepts.
func slugify(label string) string {
	var stripped strings.Builder
	for _, r := range accents.Replace(strings.ToLower(label)) {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			stripped.WriteRune(r)
		default:
			stripped.WriteRune('-')
		}
	}

	return strings.Join(strings.FieldsFunc(stripped.String(), func(r rune) bool { return r == '-' }), "-")
}
