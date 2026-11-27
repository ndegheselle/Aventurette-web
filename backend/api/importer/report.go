package importer

// What the route answers: everything wrong with the zip, fiche by fiche, and whether it was
// imported. The back office translates each problem by its code.

// problem is something the check found. An error stops the import; a warning is reported and
// does not. `Path` says where in the file, as `steps[2].materials`; `Value` is what the message
// quotes; `Label` is a translation key the message quotes, such as the kind of a reference.
type problem struct {
	Level string `json:"level"`
	Code  string `json:"code"`
	Path  string `json:"path,omitempty"`
	Value string `json:"value,omitempty"`
	Label string `json:"label,omitempty"`
}

func errorOf(code string, path string, value string) problem {
	return problem{Level: "error", Code: code, Path: path, Value: value}
}

func warningOf(code string, path string, value string) problem {
	return problem{Level: "warning", Code: code, Path: path, Value: value}
}

type report struct {
	// Whether the zip was written. False whenever any problem is an error.
	Imported bool `json:"imported"`
	// What is wrong with the zip as a whole.
	Problems []problem       `json:"problems"`
	Glossary *glossaryReport `json:"glossary"`
	Fiches   []ficheReport   `json:"fiches"`
}

type glossaryReport struct {
	Created  int       `json:"created"`
	Updated  int       `json:"updated"`
	Problems []problem `json:"problems"`
}

type ficheReport struct {
	// The fiche's folder, which is its Confluence page id.
	Folder string `json:"folder"`
	// The fiche's title, empty when it could not be read.
	Name     string `json:"name"`
	Readable bool   `json:"readable"`
	// Whether it updates the activity an earlier import made, rather than creating one.
	Update   bool      `json:"update"`
	Problems []problem `json:"problems"`
}

func hasErrors(r *report) bool {
	all := append([]problem{}, r.Problems...)
	if r.Glossary != nil {
		all = append(all, r.Glossary.Problems...)
	}
	for _, f := range r.Fiches {
		all = append(all, f.Problems...)
	}
	for _, p := range all {
		if p.Level == "error" {
			return true
		}
	}
	return false
}
