# 0027. Catalogue entries answer to aliases

Status: Accepted.

## Context

Since [0026](0026-activities-are-saved-through-an-mcp-server.md), an import creates the tags,
safety instructions and tips a fiche names when none matches. A name matched on the entry's name
or slug, whatever the case, and nothing else. The fiches are written by several people:
*coopérer*, *coopération* and *entraide* are one goal to the team, three tags to the import. The
team keeps a glossary of the reference wording, but the app had no place for it, so it could
only be pasted into each conversation and applied as well as the assistant remembered it.

## Decision

**A tag, a safety instruction and a tip have `aliases`**: the other names they go by, in one text
field, separated by `;`. A name in a sheet links the entry of its kind whose name, slug or alias
it is, whatever the case (`answersTo`). The catalogue's modals edit them as *Autres noms*, and its
search covers them.

**A glossary is loaded once, by the MCP tool `save_glossary`.** `planGlossary` decides what it
writes: an entry the catalogue has, by name or alias, gains the aliases it lacks — the glossary's
name included when the catalogue spells it otherwise — and is never renamed; the rest is created.
An alias another entry of the kind already answers to is left out and reported.

**Two more tools come before a save.** `check_fiche` checks the Markdown against the template,
before anything maps it. `preview_activity` runs `save_activity` without writing, so what it would
create is read before it is created.

## Consequences

- The glossary lives in the app: every author's imports use it, and it can be corrected in the
  catalogue rather than in a prompt.
- An alias is one more way two entries can claim the same name. The glossary refuses that, but
  the catalogue's modal does not check it: the first entry found wins.
- The aliases are one text field, not a list: a `;` inside a name cannot be written, and the
  backend's search on them is a plain substring.
- `check_fiche` reads an export, not Confluence: a row is found by the start of its label, and a
  value is not checked beyond the durations.
