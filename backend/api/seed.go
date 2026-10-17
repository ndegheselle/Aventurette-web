package main

import (
	"fmt"
	"math/rand"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/filesystem"
	"github.com/pocketbase/pocketbase/tools/osutils"
	"github.com/spf13/cobra"
)

// What marks a record as seeded: the name prefix of an activity, the email of its author.
const (
	seedPrefix = "Seed · "
	seedEmail  = "seed@test.local"
)

var (
	seedFormats   = []string{"SMALL_GAME", "BIG_GAME", "WORKSHOP"}
	seedPractices = []string{"MANUAL_CREATION", "EXPRESSION", "COOKING", "OBSERVATION", "MUSIC", "EXPERIMENTATION"}
	seedLocations = []string{"PARK", "HOUSE", "BALCONY", "CITY", "FOREST", "LAKE"}
	seedSeasons   = []string{"AUTUMN", "WINTER", "SPRING", "SUMMER"}
	seedSubjects  = []string{"Chasse au trésor", "Mime", "Cuisine", "Course d'orientation", "Théâtre d'ombres", "Jeu de piste", "Atelier peinture", "Cache-cache", "Relais", "Enquête"}
)

// registerSeedCommand adds `seed` to the CLI: `go run . seed [--count 20]`. It writes straight
// into pb_data, so no server has to run. It first removes what an earlier run left, which makes
// it safe to repeat.
func registerSeedCommand(app *pocketbase.PocketBase) {
	var count int

	command := &cobra.Command{
		Use:   "seed",
		Short: "Populate the dev database with fake activities",
		RunE: func(cmd *cobra.Command, args []string) error {
			// A compiled binary is a deployed one: only `go run` seeds.
			if !osutils.IsProbablyGoRun() {
				return fmt.Errorf("seed only runs through `go run . seed`, never on a built binary")
			}
			if err := app.Bootstrap(); err != nil {
				return err
			}
			return seed(app, count)
		},
	}
	command.Flags().IntVar(&count, "count", 20, "number of simple activities to create, on top of the complete ones")

	app.RootCmd.AddCommand(command)
}

// seed writes `count` simple activities — attributes and steps only — then the complete ones of
// `completeActivities`, which fill every field and relation the activity page can show.
func seed(app core.App, count int) error {
	return app.RunInTransaction(func(tx core.App) error {
		if err := removeSeeded(tx); err != nil {
			return err
		}

		author, err := seedAuthor(tx)
		if err != nil {
			return err
		}

		for i := 1; i <= count; i++ {
			if err := seedSimpleActivity(tx, author, i); err != nil {
				return err
			}
		}
		for _, activity := range completeActivities {
			if err := seedCompleteActivity(tx, author, activity); err != nil {
				return fmt.Errorf("%s: %w", activity.name, err)
			}
		}

		fmt.Printf("seeded %d simple and %d complete activities as %s\n", count, len(completeActivities), seedEmail)
		return nil
	})
}

func seedSimpleActivity(app core.App, author *core.Record, i int) error {
	subject := pick(seedSubjects)

	activity, err := newSeedActivity(app, author, fmt.Sprintf("%s%s %d", seedPrefix, subject, i))
	if err != nil {
		return err
	}
	activity.Set("description", fmt.Sprintf("<p>%s, une activité générée pour le développement.</p>", subject))
	activity.Set("format", pick(seedFormats))
	activity.Set("practices", pickSome(seedPractices, 3))
	activity.Set("locations", pickSome(seedLocations, 3))
	activity.Set("seasons", pickSome(seedSeasons, 3))
	activity.Set("age_min", 4+rand.Intn(4))
	activity.Set("age_max", 9+rand.Intn(6))
	activity.Set("participants_min", 2+rand.Intn(4))
	activity.Set("participants_max", 8+rand.Intn(20))
	activity.Set("indoor", rand.Intn(2) == 0)
	activity.Set("outdoor", rand.Intn(2) == 0)
	if err := app.Save(activity); err != nil {
		return err
	}

	kinds := []string{"PREPARE"}
	for range 1 + rand.Intn(3) {
		kinds = append(kinds, "CUSTOM")
	}
	if rand.Intn(2) == 0 {
		kinds = append(kinds, "CONCLUSION")
	}

	steps := make([]seedStep, len(kinds))
	for n, kind := range kinds {
		steps[n] = seedStep{
			kind:        kind,
			title:       fmt.Sprintf("Étape %d", n+1),
			description: "<p>Description de l'étape.</p>",
			duration:    5 + rand.Intn(20),
		}
	}

	return saveSteps(app, activity, steps, nil)
}

// ── Complete activities ─────────────────────────────────────────────────────────────────────

type seedTag struct{ kind, slug, name string }

type seedNamed struct{ slug, name, description string }

type seedMaterial struct{ name, quantity string }

type seedWorkshop struct {
	name, theme, challenges string
	adults                  int
	materials               []string
}

type seedStep struct {
	kind, title, description string
	duration                 int
	materials                []string
	tips                     []seedNamed
	resources                []string
}

type seedActivity struct {
	name, description, visualBrief string
	format                         string
	practices, locations, seasons  []string
	imaginaryRule, childrenPace    string
	hostEffort                     string
	hosts                          int
	ageMin, ageMax                 int
	participantsMin                int
	participantsMax                int
	indoor, outdoor                bool
	crossSupervision               bool
	ageVariants, supervisionNotes  string
	conditions                     string
	tags                           []seedTag
	safety                         []seedNamed
	materials                      []seedMaterial
	workshops                      []seedWorkshop
	steps                          []seedStep
}

// The relation each tag kind is linked through.
var tagFieldByKind = map[string]string{
	"THEME":                "theme_tags",
	"IMAGINARY":            "imaginary_tags",
	"GOAL":                 "goal_tags",
	"IDEAL_FOR":            "ideal_for_tags",
	"DEVELOP_PHYSICAL":     "development_tags",
	"DEVELOP_INTELLECTUAL": "development_tags",
	"DEVELOP_AFFECT":       "development_tags",
	"DEVELOP_SOCIAL":       "development_tags",
	"DEVELOP_MORAL":        "development_tags",
	"DEVELOP_SPIRITUAL":    "development_tags",
}

var completeActivities = []seedActivity{
	{
		name:             "Le trésor du capitaine Barbe-Grise",
		description:      "<p>Un grand jeu de piste où les équipes suivent les indices laissés par un vieux pirate pour retrouver son trésor avant la marée.</p>",
		visualBrief:      "Des enfants penchés sur une carte au trésor dans un parc, un coffre en arrière-plan.",
		format:           "BIG_GAME",
		practices:        []string{"OBSERVATION", "EXPRESSION"},
		locations:        []string{"PARK", "FOREST"},
		seasons:          []string{"SPRING", "SUMMER", "AUTUMN"},
		imaginaryRule:    "REQUIRED",
		childrenPace:     "DYNAMIC",
		hostEffort:       "HIGH",
		hosts:            4,
		ageMin:           7,
		ageMax:           12,
		participantsMin:  12,
		participantsMax:  30,
		outdoor:          true,
		ageVariants:      "<p>Pour les plus jeunes, remplacer les énigmes écrites par des dessins et raccourcir le parcours.</p>",
		supervisionNotes: "<p>Un animateur par équipe, et un au point d'arrivée. Les équipes ne quittent jamais la zone balisée.</p>",
		conditions:       "<p>Un terrain d'au moins un hectare, délimité, avec des cachettes naturelles.</p>",
		tags: []seedTag{
			{"THEME", "pirates", "Pirates"},
			{"IMAGINARY", "chasse-au-tresor", "Chasse au trésor"},
			{"GOAL", "cooperer", "Coopérer en équipe"},
			{"IDEAL_FOR", "grand-groupe", "Un grand groupe"},
			{"DEVELOP_PHYSICAL", "endurance", "Endurance"},
			{"DEVELOP_INTELLECTUAL", "logique", "Logique"},
			{"DEVELOP_SOCIAL", "entraide", "Entraide"},
		},
		safety: []seedNamed{
			{"terrain-delimite", "Terrain délimité", "<p>Baliser la zone de jeu et la montrer aux enfants avant de commencer.</p>"},
			{"chaleur", "Chaleur et soleil", "<p>Casquettes, eau à volonté et pauses à l'ombre au-delà de 25 °C.</p>"},
		},
		materials: []seedMaterial{
			{"Carte au trésor", "1 par équipe"},
			{"Foulards de couleur", "1 par enfant"},
			{"Coffre", "1"},
			{"Pièces en chocolat", "2 sachets"},
			{"Sifflet", "1 par animateur"},
		},
		workshops: []seedWorkshop{
			{"L'île aux énigmes", "Réflexion", "<p>Résoudre trois énigmes pour obtenir un morceau de carte.</p>", 1, []string{"Carte au trésor"}},
			{"Le pont de corde", "Agilité", "<p>Traverser sans toucher le sol, toute l'équipe ensemble.</p>", 2, []string{"Foulards de couleur"}},
			{"La cale du navire", "Observation", "<p>Retrouver les objets cachés dans la zone en moins de cinq minutes.</p>", 1, nil},
		},
		steps: []seedStep{
			{
				kind: "PREPARE", title: "Cacher les indices", duration: 30,
				description: "<p>Disposer les ateliers et cacher le coffre au point d'arrivée.</p>",
				materials:   []string{"Coffre", "Pièces en chocolat"},
				resources:   []string{"Plan des ateliers"},
			},
			{
				kind: "CUSTOM", title: "La légende du capitaine", duration: 10,
				description: "<p>Raconter l'histoire de Barbe-Grise et former les équipages.</p>",
				materials:   []string{"Foulards de couleur"},
				tips: []seedNamed{
					{"", "Entrer dans le personnage", "<p>Un chapeau et une voix rauque suffisent à capter l'attention des enfants.</p>"},
				},
				resources: []string{"Lettre du capitaine"},
			},
			{
				kind: "CUSTOM", title: "À l'abordage des ateliers", duration: 45,
				description: "<p>Chaque équipe fait le tour des ateliers pour reconstituer la carte.</p>",
				materials:   []string{"Carte au trésor", "Sifflet"},
				tips: []seedNamed{
					{"", "Équilibrer les équipes", "<p>Si une équipe prend trop d'avance, donnez un indice bonus aux autres.</p>"},
					{"", "Garder le rythme", "<p>Annoncez le temps restant à mi-atelier.</p>"},
				},
			},
			{
				kind: "CONCLUSION", title: "Le partage du butin", duration: 15,
				description: "<p>Ouvrir le coffre ensemble et revenir sur l'aventure.</p>",
				tips: []seedNamed{
					{"", "Valoriser chaque équipe", "<p>Trouvez une qualité à souligner pour chaque équipage, pas seulement le gagnant.</p>"},
				},
			},
		},
	},
	{
		name:             "Atelier pain d'épices",
		description:      "<p>Les enfants préparent, façonnent et décorent leurs biscuits de pain d'épices.</p>",
		visualBrief:      "Des mains d'enfants qui découpent des bonshommes dans une pâte brune.",
		format:           "WORKSHOP",
		practices:        []string{"COOKING", "MANUAL_CREATION"},
		locations:        []string{"HOUSE"},
		seasons:          []string{"WINTER"},
		imaginaryRule:    "ADAPTABLE",
		childrenPace:     "CALM",
		hostEffort:       "MEDIUM",
		hosts:            2,
		ageMin:           4,
		ageMax:           10,
		participantsMin:  4,
		participantsMax:  10,
		indoor:           true,
		crossSupervision: true,
		ageVariants:      "<p>Les plus petits décorent seulement ; les plus grands pèsent et mélangent eux-mêmes.</p>",
		supervisionNotes: "<p>Un adulte reste en permanence près du four.</p>",
		conditions:       "<p>Une cuisine avec un four et une grande table.</p>",
		tags: []seedTag{
			{"THEME", "noel", "Noël"},
			{"GOAL", "autonomie", "Gagner en autonomie"},
			{"IDEAL_FOR", "petit-groupe", "Un petit groupe"},
			{"DEVELOP_PHYSICAL", "motricite-fine", "Motricité fine"},
			{"DEVELOP_AFFECT", "confiance", "Confiance en soi"},
		},
		safety: []seedNamed{
			{"four-chaud", "Four chaud", "<p>Seul un adulte ouvre le four et sort les plaques.</p>"},
			{"allergies-alimentaires", "Allergies alimentaires", "<p>Vérifier les allergies (gluten, œufs, fruits à coque) avant l'atelier.</p>"},
		},
		materials: []seedMaterial{
			{"Farine", "500 g"},
			{"Miel", "250 g"},
			{"Épices à pain d'épices", "2 cuillères"},
			{"Emporte-pièces", "1 par enfant"},
			{"Glaçage", "2 tubes"},
		},
		workshops: []seedWorkshop{
			{"La pâte", "Cuisine", "<p>Peser et mélanger les ingrédients.</p>", 1, []string{"Farine", "Miel", "Épices à pain d'épices"}},
			{"La décoration", "Création", "<p>Décorer les biscuits refroidis.</p>", 1, []string{"Glaçage"}},
		},
		steps: []seedStep{
			{
				kind: "PREPARE", title: "Préparer le plan de travail", duration: 15,
				description: "<p>Installer les ingrédients et préchauffer le four à 180 °C.</p>",
				materials:   []string{"Farine", "Miel", "Épices à pain d'épices"},
				resources:   []string{"Recette"},
			},
			{
				kind: "CUSTOM", title: "Façonner les biscuits", duration: 25,
				description: "<p>Étaler la pâte et découper les formes.</p>",
				materials:   []string{"Emporte-pièces"},
				tips: []seedNamed{
					{"", "Pâte collante", "<p>Fariner le rouleau plutôt que la pâte.</p>"},
				},
			},
			{
				kind: "CONCLUSION", title: "Décorer et goûter", duration: 20,
				description: "<p>Décorer les biscuits refroidis puis les partager.</p>",
				materials:   []string{"Glaçage"},
			},
		},
	},
}

func seedCompleteActivity(app core.App, author *core.Record, data seedActivity) error {
	activity, err := newSeedActivity(app, author, seedPrefix+data.name)
	if err != nil {
		return err
	}
	activity.Set("description", data.description)
	activity.Set("visual_brief", data.visualBrief)
	activity.Set("format", data.format)
	activity.Set("practices", data.practices)
	activity.Set("locations", data.locations)
	activity.Set("seasons", data.seasons)
	activity.Set("imaginary_rule", data.imaginaryRule)
	activity.Set("children_pace", data.childrenPace)
	activity.Set("host_effort", data.hostEffort)
	activity.Set("recommended_hosts_numbers", data.hosts)
	activity.Set("age_min", data.ageMin)
	activity.Set("age_max", data.ageMax)
	activity.Set("participants_min", data.participantsMin)
	activity.Set("participants_max", data.participantsMax)
	activity.Set("indoor", data.indoor)
	activity.Set("outdoor", data.outdoor)
	activity.Set("cross_supervision", data.crossSupervision)
	activity.Set("age_variants", data.ageVariants)
	activity.Set("supervision_notes", data.supervisionNotes)
	activity.Set("conditions", data.conditions)

	tagIds := map[string][]string{}
	for _, tag := range data.tags {
		record, err := catalogueRecord(app, "catalog_tags", dbx.HashExp{"type": tag.kind, "slug": tag.slug}, func(r *core.Record) {
			r.Set("type", tag.kind)
			r.Set("slug", tag.slug)
			r.Set("name", tag.name)
		})
		if err != nil {
			return err
		}
		field := tagFieldByKind[tag.kind]
		tagIds[field] = append(tagIds[field], record.Id)
	}
	for field, ids := range tagIds {
		activity.Set(field, ids)
	}

	safetyIds := []string{}
	for _, instruction := range data.safety {
		record, err := catalogueRecord(app, "catalog_safety_instructions", dbx.HashExp{"slug": instruction.slug}, func(r *core.Record) {
			r.Set("slug", instruction.slug)
			r.Set("name", instruction.name)
			r.Set("description", instruction.description)
		})
		if err != nil {
			return err
		}
		safetyIds = append(safetyIds, record.Id)
	}
	activity.Set("safety_instructions", safetyIds)

	// Materials, workshops and steps point at the activity: it is saved before them.
	if err := app.Save(activity); err != nil {
		return err
	}

	// The activity's materials by catalogue name, for the workshops and steps to recall.
	materials, err := app.FindCollectionByNameOrId("activities_materials")
	if err != nil {
		return err
	}
	materialIds := map[string]string{}
	materialList := []string{}
	for _, material := range data.materials {
		item, err := catalogueRecord(app, "catalog_materials", dbx.HashExp{"name": material.name}, func(r *core.Record) {
			r.Set("name", material.name)
		})
		if err != nil {
			return err
		}
		record := core.NewRecord(materials)
		record.Set("activity", activity.Id)
		record.Set("material", item.Id)
		record.Set("quantity", material.quantity)
		if err := app.Save(record); err != nil {
			return err
		}
		materialIds[material.name] = record.Id
		materialList = append(materialList, record.Id)
	}
	activity.Set("materials", materialList)

	workshops, err := app.FindCollectionByNameOrId("activities_workshops")
	if err != nil {
		return err
	}
	workshopIds := []string{}
	for _, workshop := range data.workshops {
		record := core.NewRecord(workshops)
		record.Set("activity", activity.Id)
		record.Set("name", workshop.name)
		record.Set("theme", workshop.theme)
		record.Set("challenges", workshop.challenges)
		record.Set("adults_required", workshop.adults)
		record.Set("materials", idsOf(materialIds, workshop.materials))
		if err := app.Save(record); err != nil {
			return err
		}
		workshopIds = append(workshopIds, record.Id)
	}
	activity.Set("workshops", workshopIds)

	return saveSteps(app, activity, data.steps, materialIds)
}

// saveSteps writes the steps, their tips and resources, links them to the activity and saves it.
func saveSteps(app core.App, activity *core.Record, data []seedStep, materialIds map[string]string) error {
	steps, err := app.FindCollectionByNameOrId(stepsCollectionName)
	if err != nil {
		return err
	}
	resources, err := app.FindCollectionByNameOrId("steps_resources")
	if err != nil {
		return err
	}

	stepIds := []string{}
	for _, item := range data {
		step := core.NewRecord(steps)
		step.Set("activity", activity.Id)
		step.Set("kind", item.kind)
		step.Set("title", item.title)
		step.Set("description", item.description)
		step.Set("duration", item.duration)
		step.Set("materials", idsOf(materialIds, item.materials))

		tipIds := []string{}
		for _, tip := range item.tips {
			record, err := catalogueRecord(app, "catalog_tips", dbx.HashExp{"name": tip.name}, func(r *core.Record) {
				r.Set("name", tip.name)
				r.Set("description", tip.description)
			})
			if err != nil {
				return err
			}
			tipIds = append(tipIds, record.Id)
		}
		step.Set("tips", tipIds)

		// A resource points at its step: the step is saved first, then lists them back.
		if err := app.Save(step); err != nil {
			return err
		}
		if len(item.resources) > 0 {
			resourceIds := []string{}
			for _, name := range item.resources {
				file, err := filesystem.NewFileFromBytes(
					fmt.Appendf(nil, "%s\n\n%s — document généré pour le développement.\n", name, activity.GetString("name")),
					name+".txt",
				)
				if err != nil {
					return err
				}
				resource := core.NewRecord(resources)
				resource.Set("step", step.Id)
				resource.Set("name", name)
				resource.Set("file", file)
				if err := app.Save(resource); err != nil {
					return err
				}
				resourceIds = append(resourceIds, resource.Id)
			}
			step.Set("resources", resourceIds)
			if err := app.Save(step); err != nil {
				return err
			}
		}

		stepIds = append(stepIds, step.Id)
	}

	activity.Set("steps", stepIds)
	return app.Save(activity)
}

// ── Shared ──────────────────────────────────────────────────────────────────────────────────

const stepsCollectionName = "activities_steps"

func newSeedActivity(app core.App, author *core.Record, name string) (*core.Record, error) {
	activities, err := app.FindCollectionByNameOrId("activities")
	if err != nil {
		return nil, err
	}
	activity := core.NewRecord(activities)
	activity.Set("user", author.Id)
	activity.Set("name", name)
	activity.Set("state", "PUBLISHED")
	return activity, nil
}

// catalogueRecord finds the catalogue entry matching `match`, or creates it with `fill`. The
// catalogues are shared reference data: a run reuses them and never removes them.
func catalogueRecord(app core.App, collection string, match dbx.HashExp, fill func(*core.Record)) (*core.Record, error) {
	if record, err := app.FindFirstRecordByFilter(collection, hashFilter(match), dbx.Params(match)); err == nil {
		return record, nil
	}

	catalogue, err := app.FindCollectionByNameOrId(collection)
	if err != nil {
		return nil, err
	}
	record := core.NewRecord(catalogue)
	fill(record)
	return record, app.Save(record)
}

// hashFilter turns {"a": …, "b": …} into "a = {:a} && b = {:b}".
func hashFilter(match dbx.HashExp) string {
	filter := ""
	for field := range match {
		if filter != "" {
			filter += " && "
		}
		filter += fmt.Sprintf("%s = {:%s}", field, field)
	}
	return filter
}

// idsOf maps names to their ids, skipping the unknown ones.
func idsOf(ids map[string]string, names []string) []string {
	result := []string{}
	for _, name := range names {
		if id, ok := ids[name]; ok {
			result = append(result, id)
		}
	}
	return result
}

// removeSeeded deletes every activity a previous run created. Its steps, resources, materials
// and workshops cascade with it; the catalogue entries stay.
func removeSeeded(app core.App) error {
	activities, err := app.FindRecordsByFilter(
		"activities",
		"name ~ {:prefix}",
		"",
		0,
		0,
		dbx.Params{"prefix": seedPrefix},
	)
	if err != nil {
		return err
	}

	for _, activity := range activities {
		if err := app.Delete(activity); err != nil {
			return err
		}
	}

	return nil
}

// seedAuthor is the user that owns the fake activities, created on first use.
func seedAuthor(app core.App) (*core.Record, error) {
	if user, err := app.FindAuthRecordByEmail("users", seedEmail); err == nil {
		return user, nil
	}

	users, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		return nil, err
	}
	user := core.NewRecord(users)
	user.SetEmail(seedEmail)
	user.SetPassword("seedseedseed")
	user.SetVerified(true)
	user.Set("name", "Seed")
	user.Set("role", "USER")
	return user, app.Save(user)
}

func pick(values []string) string {
	return values[rand.Intn(len(values))]
}

// pickSome returns between one and max distinct values.
func pickSome(values []string, max int) []string {
	n := 1 + rand.Intn(min(max, len(values)))
	shuffled := append([]string(nil), values...)
	rand.Shuffle(len(shuffled), func(i, j int) { shuffled[i], shuffled[j] = shuffled[j], shuffled[i] })
	return shuffled[:n]
}
