// Package importer imports fiches from a zip (ADR 0026): one route checks the whole zip and,
// when nothing in it is an error, writes it in one transaction.
package importer

import (
	"errors"
	"io"
	"net/http"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// Route is where the back office sends a zip, as the `zip` field of a multipart form.
const Route = "/api/activities/import"

// A zip holds the fiches' pictures and files: more than PocketBase's default 32 MB.
const maxZipSize = 128 << 20

// Register binds the import route. Called once from main.
func Register(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST(Route, handle).Bind(apis.BodyLimit(maxZipSize))
		return se.Next()
	})
}

// handle answers with the check's report, and whether the zip was imported. Only an admin may
// import, and nothing about the zip is read before that is settled.
func handle(e *core.RequestEvent) error {
	if e.Auth == nil {
		return e.UnauthorizedError("Sign in to import fiches.", nil)
	}
	if e.Auth.Collection().Name != "users" || e.Auth.GetString("role") != "ADMIN" {
		return e.ForbiddenError("Only an admin imports fiches.", nil)
	}

	upload, _, err := e.Request.FormFile("zip")
	if err != nil {
		return e.BadRequestError("Send the zip as the `zip` field of a multipart form.", err)
	}
	defer upload.Close()
	data, err := io.ReadAll(upload)
	if err != nil {
		return e.BadRequestError("The zip could not be read.", err)
	}

	result, err := run(e.App, data, e.Auth.Id)
	if err != nil {
		return e.InternalServerError("The import failed.", err)
	}
	return e.JSON(http.StatusOK, result)
}

// run checks a zip and imports it when the check finds no error. A write the collections refuse
// undoes the whole import, and is reported against the fiche it was for.
func run(app core.App, data []byte, author string) (*report, error) {
	zip, err := readZip(data)
	if err != nil {
		return &report{Problems: []problem{errorOf("notZip", "", "")}, Fiches: []ficheReport{}}, nil
	}

	known, err := loadCatalogues(app)
	if err != nil {
		return nil, err
	}

	result := checkZip(zip, known, func(sourceID string) *core.Record {
		record, err := app.FindFirstRecordByData("activities", "source_id", sourceID)
		if err != nil {
			return nil
		}
		return record
	})
	if hasErrors(&result.report) {
		return &result.report, nil
	}

	if err := write(app, result.glossary, result.fiches, author); err != nil {
		var refused *saveError
		if !errors.As(err, &refused) {
			return nil, err
		}
		failure := errorOf("saveFailed", "", refused.Error())
		placed := false
		for index := range result.report.Fiches {
			if refused.folder != "" && result.report.Fiches[index].Folder == refused.folder {
				result.report.Fiches[index].Problems = append(result.report.Fiches[index].Problems, failure)
				placed = true
			}
		}
		if !placed {
			result.report.Problems = append(result.report.Problems, failure)
		}
		return &result.report, nil
	}

	result.report.Imported = true
	return &result.report, nil
}
