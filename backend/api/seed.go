package main

import (
	"fmt"
	"math/rand"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/osutils"
	"github.com/spf13/cobra"
)

// What marks a record as seeded: the name prefix of an activity, the email of its author.
const (
	seedPrefix = "Seed · "
	seedEmail  = "seed@test.local"
)

var (
	seedFormats   = []string{"SMALL_GAME", "BIG_GAME"}
	seedPractices = []string{"MANUAL_CREATION", "EXPRESSION", "COOKING", "OBSERVATION", "MUSIC"}
	seedLocations = []string{"PARK", "HOUSE", "BALCONY", "CITY", "FOREST", "LAKE"}
	seedSeasons   = []string{"AUTUMN", "WINTER", "SPRING"}
	seedKinds     = []string{"EXPLAIN", "TEAMS", "LAUNCH", "CUSTOM"}
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
	command.Flags().IntVar(&count, "count", 20, "number of activities to create")

	app.RootCmd.AddCommand(command)
}

func seed(app core.App, count int) error {
	return app.RunInTransaction(func(tx core.App) error {
		if err := removeSeeded(tx); err != nil {
			return err
		}

		author, err := seedAuthor(tx)
		if err != nil {
			return err
		}

		activities, err := tx.FindCollectionByNameOrId("activities")
		if err != nil {
			return err
		}
		steps, err := tx.FindCollectionByNameOrId(stepsCollectionName)
		if err != nil {
			return err
		}

		for i := 1; i <= count; i++ {
			subject := seedSubjects[rand.Intn(len(seedSubjects))]

			activity := core.NewRecord(activities)
			activity.Set("user", author.Id)
			activity.Set("name", fmt.Sprintf("%s%s %d", seedPrefix, subject, i))
			activity.Set("description", fmt.Sprintf("<p>%s, une activité générée pour le développement.</p>", subject))
			activity.Set("state", "PUBLISHED")
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
			if err := tx.Save(activity); err != nil {
				return err
			}

			// Steps point at their activity, and the activity lists them back.
			stepIds := []string{}
			for n, kind := range append([]string{"PREPARE"}, pickSome(seedKinds, 3)...) {
				step := core.NewRecord(steps)
				step.Set("activity", activity.Id)
				step.Set("kind", kind)
				step.Set("title", fmt.Sprintf("Étape %d", n+1))
				step.Set("description", "<p>Description de l'étape.</p>")
				step.Set("duration", 5+rand.Intn(20))
				if err := tx.Save(step); err != nil {
					return err
				}
				stepIds = append(stepIds, step.Id)
			}
			activity.Set("steps", stepIds)
			if err := tx.Save(activity); err != nil {
				return err
			}
		}

		fmt.Printf("seeded %d activities as %s\n", count, seedEmail)
		return nil
	})
}

const stepsCollectionName = "activities_steps"

// removeSeeded deletes every activity a previous run created, steps first.
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
		steps, err := app.FindAllRecords(stepsCollectionName, dbx.HashExp{"activity": activity.Id})
		if err != nil {
			return err
		}
		for _, step := range steps {
			if err := app.Delete(step); err != nil {
				return err
			}
		}
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

