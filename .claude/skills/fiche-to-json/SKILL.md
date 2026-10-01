---
name: fiche-to-json
description: Convert an activity sheet ("fiche d'activité") written from the Confluence template into the JSON file the authoring screen imports. Use when the user asks to convert, export or import a fiche, gives a fiche as Markdown (a file or pasted), or asks for "the JSON of this activity".
---

# Fiche d'activité → import JSON

The authoring list (`/activities/authoring`) has an **import** button. It takes one JSON file
per activity, then an optional cover visual, and writes the whole thing as a draft. This skill
writes that JSON from a fiche made from the template *Template - Fiche d'activité*.

What the app accepts is defined by `readActivitySheet` in
`front/src/features/activities-authoring/model/activity.import.ts`. If this document and that
file disagree, the file wins. Read it when in doubt.

## Procedure

1. **Get the fiche.** A Markdown file path, or pasted Markdown. If the user gives a Confluence
   link without its content, ask them to export the page as Markdown or paste it.
2. **Read the whole fiche** before writing anything. Map it section by section with the table
   below.
3. **Write the JSON** to `<slug-of-the-name>.json` next to the source file, or where the user
   asks. Use UTF-8, 2-space indent.
4. **Check it**: it must parse as JSON, `name` must be set, and every enum value must come from
   the lists below, spelled exactly.
5. **Report back** in a few lines: the file written, the fields left empty because the fiche
   only held template placeholders, anything dropped (resources, step tips, step visuals, end
   criteria, unmapped locations, a value that fits no enum), and the tag and safety instruction
   names used. A name only links if one of that kind already exists in the app. The import
   modal lists the ones that do not match.

## Rules

- **Never invent content.** A template placeholder is not content: italic guidance text,
  `…`, `*…*`, "Ex. …" lists copied from the template, "—" for a visual brief. Leave the field
  unset (`""`, `0`, `false`, `[]` or `null`) and say so in the report.
- **Rich text fields are HTML** (`description`, `audience.ageVariants`, `supervision.notes`,
  `place.conditions`, a step's `description`, a workshop's `challenges`). Turn Markdown
  into `<p>`, `<strong>`, `<em>`, `<ul><li>`, `<a href>`. Drop Confluence noise such as `\-` or
  `****`.
- **Plain text fields stay plain**: `name`, `visualBrief`, titles, actions, material names.
- **Enums are the codes below**, never the French label. A value that fits none is dropped and
  reported. It is not approximated.
- **Tags, safety instructions and tips are names**, as the fiche writes them: one entry per
  name, trimmed, no leading `#`. Split a comma or "et" list into several entries.
- **Numbers are plain non-negative numbers.** `0` means "not set". Take `3` from "3 ans".
  For a range such as "6 à 12 enfants", use the two bounds. For free text that is not a number,
  leave the number at `0` and keep the text in the matching notes field if one exists.
- **Durations are per step.** The two totals in the Informations table ("Temps de jeu",
  "Temps de préparation") are computed by the app from the steps. Do not store them anywhere.
  If the steps have no durations but the table has totals, leave the steps at `0` and report it.
- The keys are camelCase exactly as shown. Unknown keys are ignored by the app, so a typo is
  silently lost. Copy the key names from the example.

## Mapping

### Top of the fiche

| Fiche | JSON |
|---|---|
| `# <Nom de l'activité>` (the h1 after the template title) | `name` (required) |
| `## Description` | `description` (HTML) |
| Always | `"version": 2` |
| Always | `"tips": []`. Tips are a catalogue the activity links by name, and a fiche has no names for them: see `#### Conseil` below. Fill it only with names the user gives |

### `## Informations` table

| Row | JSON | Values |
|---|---|---|
| Format | `classification.format` | Petit jeu `SMALL_GAME`, Grand jeu `BIG_GAME`, Atelier `WORKSHOP` |
| Pratique | `classification.practices` (list) | Création manuelle `MANUAL_CREATION`, Expression `EXPRESSION`, Cuisine `COOKING`, Observation `OBSERVATION`, Musique `MUSIC`, Expérimentation `EXPERIMENTATION` |
| Thème | `classification.themes` | tag names |
| Imaginaire | `imaginary.universes` | tag names |
| Règle d'imaginaire | `imaginary.rule` | Aucun imaginaire nécessaire `NONE`, Habillage adaptable `ADAPTABLE`, Imaginaire imposé `REQUIRED` |
| Âge minimum / maximum | `audience.ageMin` / `audience.ageMax` | numbers |
| Effectif recommandé | `audience.participantsMin` / `audience.participantsMax` | numbers |
| Rythme des enfants | `audience.childrenPace` | Calme `CALM`, Dynamique `DYNAMIC` |
| Durées selon âge / variantes | `audience.ageVariants` | HTML |
| Mobilisation de l'animateur | `supervision.hostEffort` | Faible `LOW`, Moyenne `MEDIUM`, Importante `HIGH` |
| Nombre d'animateurs requis | `supervision.hostsRequired` | number. If the fiche gives a rule rather than a number, `0` and the rule goes in `supervision.notes` |
| Configuration des ateliers et contraintes d'encadrement | `supervision.notes` (HTML) | `supervision.crossSupervision: true` when it asks for a surveillance transversale |
| Lieu de pratique | `place.indoor`, `place.outdoor` | booleans, independent |
| Localisation détaillée | `place.locations` (list) | Parc `PARK`, Maison `HOUSE`, Balcon `BALCONY`, Voiture `CAR`, Ville `CITY`, Campagne `CAMPAIGN`, Forêt `FOREST`, Montagne `MOUNTAIN`, Piscine `POOL`, Lac `LAKE`, Rivière `RIVER`, Bain `BATH`, Repas `MEAL` |
| Conditions de réalisation | `place.conditions` | HTML |
| Saison | `place.seasons` (list) | Automne `AUTUMN`, Hiver `WINTER`, Printemps `SPRING`, Été `SUMMER` |
| Sécurité | `safety.instructions` | safety instruction names, or their slugs (`feu`, `eau`…) |
| Tags pédagogiques | `pedagogy.goals` | tag names |
| Idéal pour… | `pedagogy.idealFor` | tag names |
| Développement physique | `pedagogy.development.DEVELOP_PHYSICAL` | tag names |
| Développement intellectuel | `pedagogy.development.DEVELOP_INTELLECTUAL` | tag names |
| Développement affectif | `pedagogy.development.DEVELOP_AFFECT` | tag names |
| Développement social | `pedagogy.development.DEVELOP_SOCIAL` | tag names |
| Développement moral / caractère | `pedagogy.development.DEVELOP_MORAL` | tag names |
| Développement spirituel | `pedagogy.development.DEVELOP_SPIRITUAL` | tag names |
| Visuel principal | `visualBrief` | plain text brief. The image itself is picked in the import modal |
| Matériel (sans / avec) | — | derived from the list below |
| Temps de jeu, Temps de préparation | — | computed from the steps |

### `## Matériel`

Each bullet is one entry of `materials`: `{ "name": "Ballon en mousse", "quantity": "2" }`.
Split a quantity written in the bullet ("2 ballons en mousse", "Craie (1 boîte)") into
`quantity` when it is clearly one. Otherwise leave `quantity` empty.

### `## Ressources`

**Not imported.** Resources are files uploaded against a step, and a link in a fiche is not a
file. List them in the report so the author uploads them from the editor.

### `## Ateliers`

One row of the table is one entry of `workshops`:

| Column | JSON |
|---|---|
| Atelier | `name` (required for a workshop) |
| Thématique | `theme` (plain text) |
| Défi(s) proposé(s) | `challenges` (HTML) |
| Matériel | `materials`, names from the materials list |
| Adultes requis au poste | `adultsRequired` (number) |

Skip a row that is only the template's `…`.

### `## Étapes`

Each `### N. <title>` is one entry of `steps`, in the fiche's order.

| Fiche | JSON |
|---|---|
| The h3 title, without its number and without an italic *(…)* note | `title` (required. The app uses it as the description when a step has none) |
| The h3 title | `kind`: Préparer le jeu `PREPARE`, Conclusion `CONCLUSION`. Any other title is `CUSTOM` |
| *Durée estimée (minutes)* | `duration` (number) |
| Free text under the title, such as "Ce que l'animateur installe…" | `description` (HTML) |
| **Visuel de l'étape** | not imported: a step's visual is not handled yet. Report a brief that is not a placeholder |
| The actions table, column "Action à cocher", in order | `actions` (list of plain strings, without the 1.1 numbering) |
| `#### Conseil` | not imported: tips are a catalogue, and this is free text. Report it, so it can be added to the catalogue and linked |
| `#### Matériel` | `materials`, names. A name missing from `## Matériel` is added to the activity by the app |
| `#### Critère(s) de fin` | not imported. Report the criteria that are not placeholders |
| `#### Ressources` | not imported, see above |

The automatic steps ("Rassembler le matériel", "Regrouper les enfants") are generated by the app
and are never written. A step the fiche marks as "à supprimer" and that holds only placeholders
is left out.

## Example

[example.json](example.json) is a complete fiche converted. It shows every key the format reads.
Start from it and remove nothing: an unset field is written as its empty value, which keeps the
file readable for the next person who edits it.
