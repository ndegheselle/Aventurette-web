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
