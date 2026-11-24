Save an activity sheet ("fiche d'activité"), written in Markdown from the Confluence template
*Template - Fiche d'activité*, as a new draft activity in the back office. The author then corrects
it in the editor, whose link this tool returns.

## Procedure

1. **Read the whole fiche** before calling anything. If the user gives a Confluence link without
   its content, ask them to export the page as Markdown or paste it.
2. **Call `list_references`** to see the tags, safety instructions, tips and materials that
   already exist, so the names you write match them. When the user gives a glossary, its names
   come next: use one rather than a new spelling whenever it says the same thing.
3. **Call `save_activity`** with `sheet` mapped section by section from the fiche: each property's
   description says which part of the fiche fills it. Give the cover visual and each step's
   resources as absolute paths to files next to the fiche, when the fiche points at some.
4. If the tool answers with problems, nothing was saved: fix them and call it again.
5. **Report back** in a few lines: the editor link, the fields left empty because the fiche only
   held template placeholders, everything dropped (see *Not imported*, and any value that fits no
   enum), and the tags, safety instructions and tips the save created, so the author can check
   their spelling.

## Rules

- **Never invent content.** A template placeholder is not content: italic guidance text,
  `…`, `*…*`, "Ex. …" lists copied from the template, "—" for a visual brief. Leave the field
  at its empty value (`""`, `0`, `false`, `[]`, `null` for a single choice) and say so in the
  report.
- **`## Résumé` is `summary`**: plain text, 300 characters at most. The save refuses a longer
  one: leave `""` and report it, so the author shortens it. Never shorten it yourself.
- **Rich text fields are HTML** (the schema's `html`). Turn Markdown into `<p>`, `<strong>`,
  `<em>`, `<ul><li>`, `<a href>`. Drop Confluence noise such as `\-` or `****`. Every other
  string stays plain text.
- **Enums are the schema's codes**, never the French label. A value that fits none is dropped and
  reported. It is not approximated.
- **Tags, safety instructions and tips are names**, as the fiche writes them: one entry per
  name, trimmed, no leading `#`. Split a comma or "et" list into several entries. Prefer the
  spelling `list_references` gives when it is the same thing.
- **Tags, safety instructions and tips that do not exist are created** in their catalogue, with
  the name as written, so spell a new one the way the catalogue shows its names: a capital first
  letter, the rest as the fiche writes it (« concentration » is `Concentration`). Drop the
  fiche's own notes on it, such as « (nouveau mot-clé) ».
- **Numbers are plain non-negative numbers.** `0` means "not set". For free text that is not a
  number, leave `0` and keep the text in the matching notes field if one exists.
- **Durations are per step.** "Temps de jeu" and "Temps de préparation" are computed by the app.
  If the steps have no durations but the table has totals, leave the steps at `0` and report it.
  What the fiche says around a duration (« 3 manches de 12 min + 4 de rotation », « hors temps
  de jeu ») goes at the top of the step's description, as written.
- "Matériel (sans / avec)" is derived from `materials`, and is not written.
- **A step's `#### Conseil` is a tip**: `{ name, description }`, the fiche's text word for word
  in `description`. Name it from the tips catalogue or the user's glossary when one says the
  same thing, otherwise with a short title of a few words. List the names you made up in the
  report.
- **A safety instruction the fiche details** (« photosensibilité : 1 éclair par seconde au
  plus… ») is `{ name, description }`, the detail in `description`. It only fills a new
  instruction: one the catalogue has keeps its own.
- **A step's end criteria are codes, then words.** Tick a code only when the fiche ticks its
  label or writes it word for word; everything else goes in `endCriteriaOther`, as written.
  « les trois manches sont jouées » is not `ENOUGH_DONE`: it is `endCriteriaOther`.
- The automatic steps ("Rassembler le matériel", "Regrouper les enfants") are never written. A
  step the fiche marks "à supprimer" and that holds only placeholders is left out.

## Not imported

The format has no place for these. List the ones that are not placeholders in the report, so the
author adds them from the editor.

| Fiche | Why |
|---|---|
| `## Ressources`, a step's `#### Ressources` given as links | a resource is a file; a link is not one |
| A timer on an action, an action's own material or resource | actions are a list in the step's description; give the material to the step instead |
| `Source : …` | no field for it |
