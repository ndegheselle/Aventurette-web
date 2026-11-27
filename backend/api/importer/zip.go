package importer

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"path"
	"sort"
	"strings"
)

// The largest file the collections take. A bigger one is read one byte past it, enough to say so.
const maxFileSize = 2 << 20

// The largest JSON file read. Past it, the file reads as broken JSON.
const maxJSONSize = 4 << 20

// importZip is a zip's files, grouped the way an import reads them.
type importZip struct {
	glossary []byte // nil when the zip has none
	folders  []folder
	stray    []string // files neither in a fiche's folder nor the glossary
}

type folder struct {
	name  string            // the folder's own name, which is the fiche's id
	json  []byte            // its activity.json
	files map[string][]byte // every other file, by its path in the folder
	paths []string          // the same files' paths, in the zip's order
}

// readZip groups a zip's files by folder. A fiche's folder is wherever an `activity.json` is, so a
// zip that wraps everything in one more folder reads the same. macOS's `__MACOSX` copies and
// hidden files are skipped. The glossary is the shallowest `glossary.json` outside the fiches.
func readZip(data []byte) (*importZip, error) {
	reader, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return nil, err
	}

	type entry struct {
		path string
		data []byte
	}
	var entries []entry
	for _, file := range reader.File {
		name := file.Name
		if strings.HasSuffix(name, "/") || strings.HasPrefix(name, "__MACOSX/") || strings.HasPrefix(path.Base(name), ".") {
			continue
		}
		limit := int64(maxFileSize)
		if strings.HasSuffix(name, ".json") {
			limit = maxJSONSize
		}
		content, err := readCapped(file, limit)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry{name, content})
	}

	var dirs []string
	for _, e := range entries {
		if path.Base(e.path) == activityFile {
			dirs = append(dirs, dirOf(e.path))
		}
	}
	sort.Strings(dirs)

	inFiche := func(p string) bool {
		for _, dir := range dirs {
			if dir == "" || strings.HasPrefix(p, dir+"/") {
				return true
			}
		}
		return false
	}

	result := &importZip{}
	glossaryDepth, glossaryPath := -1, ""
	for _, e := range entries {
		if path.Base(e.path) != glossaryFile || inFiche(e.path) {
			continue
		}
		if depth := strings.Count(e.path, "/"); glossaryDepth < 0 || depth < glossaryDepth {
			glossaryDepth, glossaryPath, result.glossary = depth, e.path, withoutBOM(e.data)
		}
	}

	for _, dir := range dirs {
		prefix := ""
		if dir != "" {
			prefix = dir + "/"
		}
		f := folder{name: path.Base(dir), files: map[string][]byte{}}
		if dir == "" {
			f.name = "" // an activity.json at the root: refused, it is not named after its fiche
		}
		for _, e := range entries {
			if !strings.HasPrefix(e.path, prefix) {
				continue
			}
			inside := strings.TrimPrefix(e.path, prefix)
			if inside == activityFile {
				f.json = withoutBOM(e.data)
			} else {
				f.files[inside] = e.data
				f.paths = append(f.paths, inside)
			}
		}
		result.folders = append(result.folders, f)
	}

	for _, e := range entries {
		if e.path != glossaryPath && !inFiche(e.path) {
			result.stray = append(result.stray, e.path)
		}
	}

	return result, nil
}

func readCapped(file *zip.File, limit int64) ([]byte, error) {
	opened, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer opened.Close()
	return io.ReadAll(io.LimitReader(opened, limit+1))
}

func dirOf(p string) string {
	if dir := path.Dir(p); dir != "." {
		return dir
	}
	return ""
}

func withoutBOM(data []byte) []byte {
	return bytes.TrimPrefix(data, []byte("\xef\xbb\xbf"))
}

// decodeMarked reads a file as the format its `schema` names. A value of the wrong type is
// reported with its key; a missing key reads as its empty value, and the collections refuse what
// they cannot store.
func decodeMarked(data []byte, format string, into any) []problem {
	if !json.Valid(data) {
		return []problem{errorOf("json", "", "")}
	}

	var head struct {
		Schema any `json:"schema"`
	}
	if err := json.Unmarshal(data, &head); err != nil || head.Schema != format {
		return []problem{errorOf("format", "", format)}
	}

	if err := json.Unmarshal(data, into); err != nil {
		var typeError *json.UnmarshalTypeError
		if errors.As(err, &typeError) {
			return []problem{errorOf("malformed", typeError.Field, "")}
		}
		return []problem{errorOf("malformed", "", "")}
	}

	return nil
}
