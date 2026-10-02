---
name: fiche-to-json
description: Convert an activity sheet ("fiche d'activité") written from the Confluence template into the JSON file the authoring screen imports. Use when the user asks to convert, export or import a fiche, gives a fiche as Markdown (a file or pasted), or asks for "the JSON of this activity".
---

# Fiche d'activité → import JSON

The authoring list (`/activities/authoring`) has an **import** button. It takes one JSON file
per activity, then an optional cover visual, and writes the whole thing as a draft. This skill
writes that JSON from a fiche made from the template *Template - Fiche d'activité*.

The format is [fiche-activite.schema.json](fiche-activite.schema.json): every key, its type, the
database codes of each enum with their French label as `title`, and, in each `description`,
which part of the fiche fills it. Read it before writing anything.
[example.json](example.json) is a complete fiche converted against it.

What the app actually reads is `readActivitySheet` in
`front/src/features/admin/activities-authoring/model/activity.import.ts`. A spec checks that the
schema's codes are the app's. If the schema and that file still disagree, the file wins.

## Procedure

1. **Get the fiche.** A Markdown file path, or pasted Markdown. If the user gives a Confluence
   link without its content, ask them to export the page as Markdown or paste it.
2. **Read the whole fiche** before writing anything. Map it section by section with the schema's
   descriptions and the notes below.
3. **Write the JSON** to `<slug-of-the-name>.json` next to the source file, or where the user
   asks. UTF-8, 2-space indent. Start from `example.json` and remove no key: an unset field is
   written as its empty value.
4. **Validate it** against the schema:

   ```bash
   python3 -c "import json,sys,jsonschema; jsonschema.validate(json.load(open(sys.argv[1])), json.load(open(sys.argv[2])))" \
     <file>.json .claude/skills/fiche-to-json/fiche-activite.schema.json
   ```

   No `jsonschema` at hand: check by reading that it parses, `name` is set, no key is missing or
   unknown, and every enum value is a `const` of the schema.
5. **Report back** in a few lines: the file written, the fields left empty because the fiche
   only held template placeholders, everything dropped (see *Not imported*, and any value that
   fits no enum), and the tag and safety instruction names used. A name only links if one of that
   kind already exists in the app. The import modal lists the ones that do not match.

## Rules

- **Never invent content.** A template placeholder is not content: italic guidance text,
  `…`, `*…*`, "Ex. …" lists copied from the template, "—" for a visual brief. Leave the field
  at its empty value (`""`, `0`, `false`, `[]`, `null` for a single choice) and say so in the
  report.
- **Rich text fields are HTML** (the schema's `html`). Turn Markdown into `<p>`, `<strong>`,
  `<em>`, `<ul><li>`, `<a href>`. Drop Confluence noise such as `\-` or `****`. Every other
  string stays plain text.
- **Enums are the schema's codes**, never the French label. A value that fits none is dropped and
  reported. It is not approximated.
- **Tags, safety instructions and tips are names**, as the fiche writes them: one entry per
  name, trimmed, no leading `#`. Split a comma or "et" list into several entries.
- **Numbers are plain non-negative numbers.** `0` means "not set". For free text that is not a
  number, leave `0` and keep the text in the matching notes field if one exists.
- **Durations are per step.** "Temps de jeu" and "Temps de préparation" are computed by the app.
  If the steps have no durations but the table has totals, leave the steps at `0` and report it.
- "Matériel (sans / avec)" is derived from `materials`, and is not written.
- `tips` stays `[]` unless the user gives names from the tips catalogue.
- The automatic steps ("Rassembler le matériel", "Regrouper les enfants") are never written. A
  step the fiche marks "à supprimer" and that holds only placeholders is left out.

## Not imported

The schema has no key for these: the database does not store them, or stores files rather than
text. List the ones that are not placeholders in the report, so the author adds them from the
editor.

| Fiche | Why |
|---|---|
| `## Ressources`, a step's `#### Ressources` | resources are files uploaded against a step, and a link is not a file |
| A step's **Visuel de l'étape** | a step's visual is not handled yet |
| A step's `#### Conseil` | tips are a catalogue linked by name, and this is free text: it can be added to the catalogue, then linked |
| A step's `#### Critère(s) de fin` | not handled yet |
| A timer on an action, an action's own material or resource | an action is plain text; give the material to the step instead |
| `Source : …` | no field for it |
