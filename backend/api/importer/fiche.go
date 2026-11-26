package importer

// The files of an import zip, as docs/user/import/activity.schema.json and glossary.schema.json
// describe them. Decoding into these types is the type check: a value of the wrong kind is
// reported with the key it sits at. A missing key reads as its empty value.

const (
	ficheFormat    = "aventurette.activity.v1"
	glossaryFormat = "aventurette.glossary.v1"
	activityFile   = "activity.json"
	glossaryFile   = "glossary.json"
)

// fiche is one `activity.json`.
type fiche struct {
	Schema      string `json:"schema"`
	ID          string `json:"id"` // the Confluence page id
	Name        string `json:"name"`
	Summary     string `json:"summary"`
	Description string `json:"description"`
	Visual      visual `json:"visual"`

	Classification struct {
		Format    *string  `json:"format"`
		Practices []string `json:"practices"`
		Themes    []string `json:"themes"`
	} `json:"classification"`

	Imaginary struct {
		Rule      *string  `json:"rule"`
		Universes []string `json:"universes"`
	} `json:"imaginary"`

	Audience struct {
		AgeMin          *int    `json:"ageMin"`
		AgeMax          *int    `json:"ageMax"`
		ParticipantsMin *int    `json:"participantsMin"`
		ParticipantsMax *int    `json:"participantsMax"`
		ChildrenPace    *string `json:"childrenPace"`
		AgeVariants     string  `json:"ageVariants"`
	} `json:"audience"`

	Supervision struct {
		HostEffort       *string `json:"hostEffort"`
		HostsRequired    *int    `json:"hostsRequired"`
		CrossSupervision bool    `json:"crossSupervision"`
		Notes            string  `json:"notes"`
	} `json:"supervision"`

	Place struct {
		Indoor     bool     `json:"indoor"`
		Outdoor    bool     `json:"outdoor"`
		Locations  []string `json:"locations"`
		Conditions string   `json:"conditions"`
		Seasons    []string `json:"seasons"`
	} `json:"place"`

	Safety []string `json:"safety"`

	Pedagogy struct {
		Goals       []string            `json:"goals"`
		IdealFor    []string            `json:"idealFor"`
		Development map[string][]string `json:"development"`
	} `json:"pedagogy"`

	GatherDuration *int `json:"gatherDuration"`

	Materials []struct {
		Name     string `json:"name"`
		Quantity string `json:"quantity"`
	} `json:"materials"`

	Resources []struct {
		Name string `json:"name"`
		File string `json:"file"`
	} `json:"resources"`

	Workshops []workshop `json:"workshops"`
	Steps     []step     `json:"steps"`
	ToConfirm []string   `json:"toConfirm"`
}

type visual struct {
	Brief string  `json:"brief"`
	File  *string `json:"file"` // a path in the fiche's folder
}

type workshop struct {
	Name           string   `json:"name"`
	Theme          string   `json:"theme"`
	Challenges     string   `json:"challenges"`
	AdultsRequired *int     `json:"adultsRequired"`
	Materials      []string `json:"materials"`
}

type step struct {
	Kind             string   `json:"kind"`
	Title            string   `json:"title"`
	Duration         *int     `json:"duration"`
	Description      string   `json:"description"`
	Actions          []string `json:"actions"`
	Visual           visual   `json:"visual"`
	Materials        []string `json:"materials"`
	Resources        []string `json:"resources"`
	Tips             []string `json:"tips"`
	Advice           string   `json:"advice"`
	EndCriteria      []string `json:"endCriteria"`
	EndCriteriaOther string   `json:"endCriteriaOther"`
}

// developmentAxes maps the fiche's names for the development axes to the tag kinds they are in
// the app, in the order they are checked and reported.
var developmentAxes = []struct{ axis, kind string }{
	{"physical", "DEVELOP_PHYSICAL"},
	{"intellectual", "DEVELOP_INTELLECTUAL"},
	{"affect", "DEVELOP_AFFECT"},
	{"social", "DEVELOP_SOCIAL"},
	{"moral", "DEVELOP_MORAL"},
	{"spiritual", "DEVELOP_SPIRITUAL"},
}

// glossary is `glossary.json`.
type glossary struct {
	Schema string `json:"schema"`
	Tags   []struct {
		Kind string `json:"kind"`
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"tags"`
	Tips   []glossaryEntry `json:"tips"`
	Safety []glossaryEntry `json:"safety"`
}

type glossaryEntry struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
