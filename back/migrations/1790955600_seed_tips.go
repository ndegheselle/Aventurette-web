package migrations

import (
	"fmt"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The tips every activity can give, from the "Conseils d'animation — Référentiel" page: rather
// than each sheet rewording how to form teams or end a game, its step links the tip. The slug is
// the page's identifier, stable so a sheet can name a tip by it.
//
// The rollback deletes them by slug: a tip someone added since is not this migration's to remove.
func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId(catalogPrefix + tipsCollection)
		if err != nil {
			return err
		}

		for _, tip := range seededTips() {
			record := core.NewRecord(collection)
			record.Set("slug", tip.slug)
			record.Set("name", tip.name)
			record.Set("description", tip.html())
			if err := app.Save(record); err != nil {
				return fmt.Errorf("tip %s: %w", tip.slug, err)
			}
		}

		return nil
	}, func(app core.App) error {
		for _, tip := range seededTips() {
			records, err := app.FindRecordsByFilter(
				catalogPrefix+tipsCollection,
				"slug = {:slug}",
				"",
				0,
				0,
				dbx.Params{"slug": tip.slug},
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

		return nil
	})
}

// One tip of the referential: an optional line saying when it applies, then its points.
type seedTip struct {
	slug, name string
	about      string
	points     []string
}

// html is the tip as the editor stores it: the line, then the points as a list.
func (tip seedTip) html() string {
	var b strings.Builder
	if tip.about != "" {
		b.WriteString("<p><em>" + tip.about + "</em></p>")
	}
	b.WriteString("<ul>")
	for _, point := range tip.points {
		b.WriteString("<li>" + point + "</li>")
	}
	b.WriteString("</ul>")
	return b.String()
}

func seededTips() []seedTip {
	return []seedTip{
		{
			slug: "constitution-equipes",
			name: "Constituer des équipes",
			points: []string{
				"Comptage (par 2, par 3…)",
				"Tirage au sort",
				"Répartition équilibrée par âge ou par niveau",
				"Par affinités",
			},
		},
		{
			slug: "quand-arreter",
			name: "Quand arrêter un jeu ou une activité",
			points: []string{
				"Le temps alloué est écoulé",
				"Les enfants ont réalisé suffisamment de défis ou d'étapes",
				"Le groupe se disperse, l'attention retombe",
				"Une équipe a remporté la partie (jeu à condition de victoire)",
			},
		},
		{
			slug: "annoncer-fin",
			name: "Annoncer la fin de l'activité",
			points: []string{
				"Prévenir quelques minutes avant l'arrêt effectif (« plus que 5 minutes »)",
				"Utiliser un signal reconnu du groupe (sonore, geste, chant de ralliement)",
				"Terminer sur une note positive, même si tout n'a pas été fait",
			},
		},
		{
			slug:  "mener-un-debriefing",
			name:  "Mener un débriefing",
			about: "Pour les activités où l'échange qui suit compte autant que l'activité elle-même (jeux de réflexion, activités spirituelles ou de connaissance de soi, temps de silence…).",
			points: []string{
				"Poser des questions ouvertes plutôt que fermées : « qu'as-tu ressenti ? » plutôt que « c'était bien ? »",
				"Laisser le silence s'installer après une question — ne pas répondre à la place des enfants pour combler le vide",
				"Ne jamais forcer un enfant à parler ou à partager : le silence ou un simple « je ne sais pas » sont des réponses acceptables",
				"Accueillir toutes les réponses sans jugement, y compris les plus courtes ou les plus inattendues",
				"Reformuler pour montrer qu'on a entendu, sans interpréter ou corriger ce que l'enfant a voulu dire",
				"Rester neutre sur les convictions personnelles ou les croyances : chacun peut avoir un rapport différent au sujet abordé, il n'y a pas de bonne réponse à imposer",
				"Adapter la profondeur du débrief à l'âge : très court et concret pour les plus jeunes, plus long et ouvert pour les plus grands",
			},
		},
		{
			slug: "bien-conclure",
			name: "Bien conclure une activité ou un jeu",
			points: []string{
				"Annoncer le résultat si l'activité en comportait un (vainqueur, score…)",
				"Féliciter l'ensemble des participants, pas seulement les gagnants",
				"Revenir brièvement sur ce qui a été fait ou appris",
				"Ranger le matériel tous ensemble",
			},
		},
	}
}
