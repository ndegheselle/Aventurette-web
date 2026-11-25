# Importing fiches

A fiche d'activité is written in Confluence, from the template. An assistant there, given the
fiche, the glossary and [activity.schema.json](activity.schema.json), writes it as JSON. The back
office imports a zip of those files: it checks the whole zip first, shows what is wrong or
missing, and writes nothing until the check passes and the import is confirmed.

## The zip

```
import.zip
├── glossary.json                 optional — glossary.schema.json
├── 130973697/                    one folder per fiche, named after its Confluence page id
│   ├── activity.json             activity.schema.json
│   ├── couverture.png
│   └── ressources/
│       └── code-morse.pdf
└── 131006465/
    └── activity.json
```

- **One folder per fiche**, holding its `activity.json` and every file it names. A path in
  `activity.json` is relative to it.
- **A file is PNG, JPEG or PDF, 2 MB at most.** A cover or step visual is PNG or JPEG.
- **`glossary.json` is applied first**, so a fiche can use a keyword the same zip adds.
- A file nothing names is reported and left out.

[example/130973697/activity.json](example/130973697/activity.json) is *Les Phares — Morse
lumineux*, written this way. Its three tips are not in the fiche: they show the field.

## Identifiers

- **A fiche is its Confluence page id.** It is the same page from Brouillons to Publiées, so
  importing it again updates the activity it created, whatever its title has become.
- **Tags, tips and safety instructions are glossary identifiers**, such as
  `constitution-equipes` or `premiers-secours`, never their wording. The import refuses an
  identifier the glossary does not have: add the keyword to the glossary page, export
  `glossary.json` again, and put it in the zip.
- **Materials are names**, as Catalogue du matériel names them. A name the catalogue lacks is
  added to it, and the check lists it so a misspelling is caught.

## What the check reports

Errors stop the import; warnings are shown and can be accepted.

| | |
|---|---|
| Error | a file that does not match its schema |
| Error | an identifier the glossary does not have |
| Error | a file named but missing from the zip, or over 2 MB |
| Error | a step naming a material or resource the fiche does not list |
| Warning | a material the catalogue does not have yet |
| Warning | the rows in `toConfirm`, still « à valider » in the fiche |
| Warning | an empty field the template expects: summary, description, ages, durations… |
| Warning | a file in the zip that nothing names |
| Warning | a resource no step names: the app keeps resources on steps |

## What the JSON leaves out

| Fiche | Why |
|---|---|
| « Temps de jeu », « Temps de préparation », « Avec / sans matériel » | computed from the steps and the material |
| « Source : adapté de… » | removed when the fiche is published |
| Labels (`dev-…`, `age-…`, `scout`) | Confluence's own index, derived from the fields |
| A step action's timer | not settled in the template yet |
| A « Localisation détaillée » no code names | the app has a fixed list of places |

# activity.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aventurette.app/schemas/activity.v1.json",
  "title": "Fiche d'activité",
  "description": "One fiche d'activité, written from the Confluence page that holds it: the Template - Fiche d'activité, filled. One file per fiche, `activity.json`, in a folder of the import zip with the files it names. Every key is written, with its empty value when the fiche leaves it empty: \"\" for text, null for a number or a single choice, [] for a list. Enum values are the codes below, never the French label. Tags, tips and safety instructions are glossary identifiers, never wording: an identifier the glossary lacks is refused at import.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema",
    "id",
    "name",
    "summary",
    "description",
    "visual",
    "classification",
    "imaginary",
    "audience",
    "supervision",
    "place",
    "safety",
    "pedagogy",
    "gatherDuration",
    "materials",
    "resources",
    "workshops",
    "steps",
    "toConfirm"
  ],
  "properties": {
    "schema": {
      "const": "aventurette.activity.v1"
    },
    "id": {
      "type": "string",
      "pattern": "^[0-9]+$",
      "description": "The Confluence page id of the fiche: 130973697 in `/wiki/spaces/OC/pages/130973697/…`. A fiche is one page from Brouillons to Publiées, so the id never changes: importing a fiche again updates the activity it created."
    },
    "name": {
      "type": "string",
      "pattern": "\\S",
      "description": "Title of the fiche: the page title, without a « Fiche 1/4 — » numbering. Plain text."
    },
    "summary": {
      "type": "string",
      "maxLength": 300,
      "description": "Section « Résumé »: a few sentences shown under the title. Plain text, 300 characters at most."
    },
    "description": {
      "$ref": "#/$defs/html",
      "description": "Section « Description »: what the children do, why it is worth doing, what to know before starting."
    },
    "visual": {
      "$ref": "#/$defs/visual",
      "description": "Row « Visuel principal »: the cover."
    },
    "classification": {
      "type": "object",
      "additionalProperties": false,
      "required": ["format", "practices", "themes"],
      "properties": {
        "format": {
          "anyOf": [{ "$ref": "#/$defs/format" }, { "type": "null" }],
          "description": "Row « Format »."
        },
        "practices": {
          "type": "array",
          "uniqueItems": true,
          "items": { "$ref": "#/$defs/practice" },
          "description": "Row « Pratique ». For an atelier only."
        },
        "themes": {
          "$ref": "#/$defs/ids",
          "description": "Row « Thème »: what the activity is about. Glossary identifiers of kind THEME."
        }
      }
    },
    "imaginary": {
      "type": "object",
      "additionalProperties": false,
      "required": ["rule", "universes"],
      "properties": {
        "rule": {
          "anyOf": [{ "$ref": "#/$defs/imaginaryRule" }, { "type": "null" }],
          "description": "Row « Règle d'imaginaire »."
        },
        "universes": {
          "$ref": "#/$defs/ids",
          "description": "Row « Imaginaire »: the narrative dressing, if any. Glossary identifiers of kind IMAGINARY."
        }
      }
    },
    "audience": {
      "type": "object",
      "additionalProperties": false,
      "required": ["ageMin", "ageMax", "participantsMin", "participantsMax", "childrenPace", "ageVariants"],
      "properties": {
        "ageMin": {
          "$ref": "#/$defs/count",
          "description": "Row « Âge minimum », in years: 11 from « 11 à 13 ans »."
        },
        "ageMax": {
          "$ref": "#/$defs/count",
          "description": "Row « Âge maximum », in years."
        },
        "participantsMin": {
          "$ref": "#/$defs/count",
          "description": "Row « Effectif recommandé », lower bound: 12 from « Min 12 · Max 24 »."
        },
        "participantsMax": {
          "$ref": "#/$defs/count",
          "description": "Row « Effectif recommandé », upper bound."
        },
        "childrenPace": {
          "anyOf": [{ "$ref": "#/$defs/childrenPace" }, { "type": "null" }],
          "description": "Row « Rythme des enfants »."
        },
        "ageVariants": {
          "$ref": "#/$defs/html",
          "description": "Row « Durées selon âge / variantes », as written."
        }
      }
    },
    "supervision": {
      "type": "object",
      "additionalProperties": false,
      "required": ["hostEffort", "hostsRequired", "crossSupervision", "notes"],
      "properties": {
        "hostEffort": {
          "anyOf": [{ "$ref": "#/$defs/hostEffort" }, { "type": "null" }],
          "description": "Row « Mobilisation de l'animateur »."
        },
        "hostsRequired": {
          "$ref": "#/$defs/count",
          "description": "Row « Nombre d'animateurs requis »: the number. What the row says around it (« 1 par ligne de postes + 1 coordination ») goes in `notes`."
        },
        "crossSupervision": {
          "type": "boolean",
          "description": "The ateliers need a surveillance transversale."
        },
        "notes": {
          "$ref": "#/$defs/html",
          "description": "Row « Configuration des ateliers et contraintes d'encadrement », then what row « Nombre d'animateurs requis » says around its number."
        }
      }
    },
    "place": {
      "type": "object",
      "additionalProperties": false,
      "required": ["indoor", "outdoor", "locations", "conditions", "seasons"],
      "properties": {
        "indoor": {
          "type": "boolean",
          "description": "Row « Lieu de pratique » holds Intérieur. Independent of `outdoor`."
        },
        "outdoor": {
          "type": "boolean",
          "description": "Row « Lieu de pratique » holds Extérieur."
        },
        "locations": {
          "type": "array",
          "uniqueItems": true,
          "items": { "$ref": "#/$defs/location" },
          "description": "Row « Localisation détaillée »: the codes its places match. A place no code names is not written."
        },
        "conditions": {
          "$ref": "#/$defs/html",
          "description": "Row « Conditions de réalisation », and the safety rules the fiche details beyond its safety tags."
        },
        "seasons": {
          "type": "array",
          "uniqueItems": true,
          "items": { "$ref": "#/$defs/season" },
          "description": "Row « Saison »."
        }
      }
    },
    "safety": {
      "$ref": "#/$defs/ids",
      "description": "Row « Sécurité »: identifiers from Sécurité — Référentiel, such as `feu` or `premiers-secours`."
    },
    "pedagogy": {
      "type": "object",
      "additionalProperties": false,
      "required": ["goals", "idealFor", "development"],
      "properties": {
        "goals": {
          "$ref": "#/$defs/ids",
          "description": "Row « Tags pédagogiques ». Glossary identifiers of kind GOAL."
        },
        "idealFor": {
          "$ref": "#/$defs/ids",
          "description": "Row « Idéal pour… ». Glossary identifiers of kind IDEAL_FOR."
        },
        "development": {
          "type": "object",
          "additionalProperties": false,
          "description": "The six rows « Développement … »: the canonical families each one lists, as glossary identifiers of that row's kind.",
          "required": ["physical", "intellectual", "affect", "social", "moral", "spiritual"],
          "properties": {
            "physical": { "$ref": "#/$defs/ids", "description": "« Développement physique »: kind DEVELOP_PHYSICAL." },
            "intellectual": { "$ref": "#/$defs/ids", "description": "« Développement intellectuel »: kind DEVELOP_INTELLECTUAL." },
            "affect": { "$ref": "#/$defs/ids", "description": "« Développement affectif »: kind DEVELOP_AFFECT." },
            "social": { "$ref": "#/$defs/ids", "description": "« Développement social »: kind DEVELOP_SOCIAL." },
            "moral": { "$ref": "#/$defs/ids", "description": "« Développement moral / caractère »: kind DEVELOP_MORAL." },
            "spiritual": { "$ref": "#/$defs/ids", "description": "« Développement spirituel »: kind DEVELOP_SPIRITUAL." }
          }
        }
      }
    },
    "gatherDuration": {
      "$ref": "#/$defs/count",
      "description": "Minutes of « Rassembler le matériel », the preparation step the app generates from `materials`. With the PREPARE step, it makes « Temps de préparation »."
    },
    "materials": {
      "type": "array",
      "description": "Section « Matériel », one entry per bullet. « Avec / sans matériel » follows from it.",
      "items": { "$ref": "#/$defs/material" }
    },
    "resources": {
      "type": "array",
      "description": "Section « Ressources »: the files attached to the page and linked there. A resource the fiche writes out as text has to be exported as a file and attached first.",
      "items": { "$ref": "#/$defs/resource" }
    },
    "workshops": {
      "type": "array",
      "description": "Section « Ateliers », one entry per row. [] when the fiche has no ateliers.",
      "items": { "$ref": "#/$defs/workshop" }
    },
    "steps": {
      "type": "array",
      "minItems": 1,
      "description": "Section « Étapes », in the fiche's order. « Rassembler le matériel » is generated by the app and is not written. « Temps de jeu » and « Temps de préparation » are the sums of the durations, and are not written either.",
      "items": { "$ref": "#/$defs/step" }
    },
    "toConfirm": {
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "pattern": "\\S" },
      "description": "The rows and steps the fiche still marks « à valider », by their template label or step title. The value is written as the fiche gives it; the import lists these for review."
    }
  },
  "$defs": {
    "html": {
      "type": "string",
      "description": "Rich text in HTML, limited to <p>, <br>, <strong>, <em>, <ul>, <ol>, <li> and <a href>. \"\" when empty."
    },
    "count": {
      "anyOf": [{ "type": "integer", "minimum": 0 }, { "type": "null" }],
      "description": "A whole number, or null when the fiche gives none."
    },
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$",
      "description": "A glossary identifier: lowercase, no accents, words joined by -."
    },
    "ids": {
      "type": "array",
      "uniqueItems": true,
      "items": { "$ref": "#/$defs/id" }
    },
    "file": {
      "type": "string",
      "pattern": "^(?!/)(?!.*\\.\\./)(?!.*\\\\).+\\.(png|jpe?g|pdf|PNG|JPE?G|PDF)$",
      "description": "Path of a file in the zip, relative to this activity.json, with forward slashes: `ressources/code-morse.pdf`. PNG, JPEG or PDF, 2 MB at most."
    },
    "image": {
      "type": "string",
      "pattern": "^(?!/)(?!.*\\.\\./)(?!.*\\\\).+\\.(png|jpe?g|PNG|JPE?G)$",
      "description": "Path of an image in the zip, relative to this activity.json: PNG or JPEG, 2 MB at most."
    },
    "visual": {
      "type": "object",
      "additionalProperties": false,
      "required": ["brief", "file"],
      "properties": {
        "brief": {
          "type": "string",
          "description": "The brief the illustrator works from, without a leading « Brief : ». Plain text."
        },
        "file": {
          "anyOf": [{ "$ref": "#/$defs/image" }, { "type": "null" }],
          "description": "The finished visual, once Illustrer has produced it. null before."
        }
      }
    },
    "format": {
      "oneOf": [
        { "const": "SMALL_GAME", "title": "Petit jeu" },
        { "const": "BIG_GAME", "title": "Grand jeu" },
        { "const": "WORKSHOP", "title": "Atelier" }
      ]
    },
    "practice": {
      "oneOf": [
        { "const": "MANUAL_CREATION", "title": "Création manuelle" },
        { "const": "EXPRESSION", "title": "Expression" },
        { "const": "COOKING", "title": "Cuisine" },
        { "const": "OBSERVATION", "title": "Observation" },
        { "const": "MUSIC", "title": "Musique" },
        { "const": "EXPERIMENTATION", "title": "Expérimentation" }
      ]
    },
    "imaginaryRule": {
      "oneOf": [
        { "const": "NONE", "title": "Aucun imaginaire nécessaire" },
        { "const": "ADAPTABLE", "title": "Habillage adaptable" },
        { "const": "REQUIRED", "title": "Imaginaire imposé" }
      ]
    },
    "childrenPace": {
      "oneOf": [
        { "const": "CALM", "title": "Calme" },
        { "const": "DYNAMIC", "title": "Dynamique" }
      ]
    },
    "hostEffort": {
      "oneOf": [
        { "const": "LOW", "title": "Faible" },
        { "const": "MEDIUM", "title": "Moyenne" },
        { "const": "HIGH", "title": "Importante" }
      ]
    },
    "location": {
      "oneOf": [
        { "const": "PARK", "title": "Parc" },
        { "const": "HOUSE", "title": "Maison" },
        { "const": "BALCONY", "title": "Balcon" },
        { "const": "CAR", "title": "Voiture" },
        { "const": "CITY", "title": "Ville" },
        { "const": "CAMPAIGN", "title": "Campagne" },
        { "const": "FOREST", "title": "Forêt" },
        { "const": "MOUNTAIN", "title": "Montagne" },
        { "const": "POOL", "title": "Piscine" },
        { "const": "LAKE", "title": "Lac" },
        { "const": "RIVER", "title": "Rivière" },
        { "const": "BATH", "title": "Bain" },
        { "const": "MEAL", "title": "Repas" }
      ]
    },
    "season": {
      "oneOf": [
        { "const": "AUTUMN", "title": "Automne" },
        { "const": "WINTER", "title": "Hiver" },
        { "const": "SPRING", "title": "Printemps" },
        { "const": "SUMMER", "title": "Été" }
      ]
    },
    "stepKind": {
      "oneOf": [
        { "const": "PREPARE", "title": "Préparer le jeu: before the children arrive" },
        { "const": "CUSTOM", "title": "Every step between the two" },
        { "const": "CONCLUSION", "title": "Conclusion" }
      ]
    },
    "endCriterion": {
      "oneOf": [
        { "const": "TIME_UP", "title": "Le temps alloué est écoulé" },
        { "const": "ENOUGH_DONE", "title": "Les enfants ont réalisé suffisamment de défis ou d'étapes" },
        { "const": "ATTENTION_DROPS", "title": "Le groupe se disperse, l'attention retombe" },
        { "const": "TEAM_WON", "title": "Une équipe a remporté la partie" }
      ]
    },
    "material": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "quantity"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "\\S",
          "description": "The material, as Catalogue du matériel — Référentiel names it: « Lampe torche à bouton poussoir »."
        },
        "quantity": {
          "type": "string",
          "description": "What the bullet says after the name: « 2 par équipe, soit 8 (ni laser ni projecteur) ». \"\" when it says nothing."
        }
      }
    },
    "resource": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "file"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "\\S",
          "description": "The link's text: « Code Morse ». Steps name the resource by it."
        },
        "file": { "$ref": "#/$defs/file" }
      }
    },
    "workshop": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "theme", "challenges", "adultsRequired", "materials"],
      "properties": {
        "name": { "type": "string", "pattern": "\\S", "description": "Column « Atelier »." },
        "theme": { "type": "string", "description": "Column « Thématique ». Plain text." },
        "challenges": { "$ref": "#/$defs/html", "description": "Column « Défi(s) proposé(s) »." },
        "adultsRequired": { "$ref": "#/$defs/count", "description": "Column « Adultes requis au poste »." },
        "materials": {
          "type": "array",
          "uniqueItems": true,
          "items": { "type": "string", "pattern": "\\S" },
          "description": "Column « Matériel »: names of entries of `materials`."
        }
      }
    },
    "step": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "title",
        "duration",
        "description",
        "actions",
        "visual",
        "materials",
        "resources",
        "tips",
        "advice",
        "endCriteria",
        "endCriteriaOther"
      ],
      "properties": {
        "kind": {
          "$ref": "#/$defs/stepKind",
          "description": "« Préparer le jeu » is PREPARE, « Conclusion » is CONCLUSION, any other step is CUSTOM."
        },
        "title": {
          "type": "string",
          "pattern": "\\S",
          "description": "The step's title, without its number. Plain text."
        },
        "duration": {
          "$ref": "#/$defs/count",
          "description": "« Durée estimée », in minutes, for the whole step."
        },
        "description": {
          "$ref": "#/$defs/html",
          "description": "What the step says outside its actions: how its duration splits (« 3 manches de 12 min + 4 min de rotation »), the « Message à dire »."
        },
        "actions": {
          "type": "array",
          "items": { "type": "string", "pattern": "\\S" },
          "description": "Column « Action à cocher », in order, without the 1.1 numbering. Plain text, one action each."
        },
        "visual": {
          "$ref": "#/$defs/visual",
          "description": "« Visuel de l'étape »: the one picture or animation of the step."
        },
        "materials": {
          "type": "array",
          "uniqueItems": true,
          "items": { "type": "string", "pattern": "\\S" },
          "description": "The step's material: names of entries of `materials`."
        },
        "resources": {
          "type": "array",
          "uniqueItems": true,
          "items": { "type": "string", "pattern": "\\S" },
          "description": "The step's resources: names of entries of `resources`."
        },
        "tips": {
          "$ref": "#/$defs/ids",
          "description": "The reusable « Conseil » the step refers to: identifiers from Conseils d'animation — Référentiel, such as `constitution-equipes`."
        },
        "advice": {
          "$ref": "#/$defs/html",
          "description": "The step's own « Conseil », when it is written for this fiche rather than taken from the référentiel."
        },
        "endCriteria": {
          "type": "array",
          "uniqueItems": true,
          "items": { "$ref": "#/$defs/endCriterion" },
          "description": "« Critère(s) de fin »: the criteria of `quand-arreter` the fiche keeps."
        },
        "endCriteriaOther": {
          "type": "string",
          "description": "« Critère(s) de fin » the four codes do not say, as written: « les trois manches sont jouées ». Plain text."
        }
      }
    }
  }
}
```

# glossary.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aventurette.app/schemas/glossary.v1.json",
  "title": "Glossaire",
  "description": "The vocabulary fiches refer to, written from Glossaire des mots-clés, Conseils d'animation and Sécurité — Référentiel. `glossary.json` at the root of an import zip; it is applied before the activities, so a fiche can use an entry the same zip adds. An entry is found by its kind and identifier: a new one is created, a known one takes the name and description given. An entry left out is kept.",
  "type": "object",
  "additionalProperties": false,
  "required": ["schema", "tags", "tips", "safety"],
  "properties": {
    "schema": {
      "const": "aventurette.glossary.v1"
    },
    "tags": {
      "type": "array",
      "description": "Glossaire des mots-clés: one entry per canonical keyword (a Thème subject, an Imaginaire keyword, a tag pédagogique, an « Idéal pour… » usage, a Développement family).",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["kind", "id", "name"],
        "properties": {
          "kind": { "$ref": "#/$defs/tagKind" },
          "id": { "$ref": "#/$defs/id" },
          "name": {
            "type": "string",
            "pattern": "\\S",
            "description": "The canonical keyword, as the glossary writes it: « Coopérer et s'entraider »."
          }
        }
      }
    },
    "tips": {
      "type": "array",
      "description": "Conseils d'animation — Référentiel: one entry per category.",
      "items": { "$ref": "#/$defs/described" }
    },
    "safety": {
      "type": "array",
      "description": "Sécurité — Référentiel: one entry per category.",
      "items": { "$ref": "#/$defs/described" }
    }
  },
  "$defs": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$",
      "description": "The identifier the référentiel gives, such as `constitution-equipes`. Lowercase, no accents, words joined by -. Never changes once fiches use it."
    },
    "tagKind": {
      "oneOf": [
        { "const": "THEME", "title": "Thème" },
        { "const": "IMAGINARY", "title": "Imaginaire" },
        { "const": "GOAL", "title": "Tags pédagogiques" },
        { "const": "IDEAL_FOR", "title": "Idéal pour…" },
        { "const": "DEVELOP_PHYSICAL", "title": "Développement physique" },
        { "const": "DEVELOP_INTELLECTUAL", "title": "Développement intellectuel" },
        { "const": "DEVELOP_AFFECT", "title": "Développement affectif" },
        { "const": "DEVELOP_SOCIAL", "title": "Développement social" },
        { "const": "DEVELOP_MORAL", "title": "Développement moral / caractère" },
        { "const": "DEVELOP_SPIRITUAL", "title": "Développement spirituel" }
      ]
    },
    "described": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "name", "description"],
      "properties": {
        "id": { "$ref": "#/$defs/id" },
        "name": {
          "type": "string",
          "pattern": "\\S",
          "description": "The category's title: « Constituer des équipes »."
        },
        "description": {
          "type": "string",
          "description": "The category's text in HTML (<p>, <ul>, <li>, <strong>, <em>), its intro line included."
        }
      }
    }
  }
}
```
