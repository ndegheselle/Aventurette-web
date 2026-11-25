# 0026. Fiches are imported from a zip, written as JSON at the source

Status: Accepted. It replaces the MCP server that saved a fiche, and the catalogue aliases that
came with it (the former 0027). Where [0017](0017-an-activity-is-saved-in-one-batch.md) and
[0018](0018-safety-instructions-and-tips-are-catalogues.md) say "the import", read this one: it
links tips and safety instructions by identifier, not by name.

## Context

The fiches are written in Confluence, from a template, with référentiels for the vocabulary:
the keyword glossary, the animation tips and the safety categories. They are well structured
where they are written.

The MCP server read a Markdown export of a fiche and wrote it to the backend in the same
request. Its first real use, four fiches of one *fil rouge*, showed where that fails:

- **The export loses the structure.** Tables are flattened into prose, rows wrap, and
  Confluence noise stays in the text. A resources table came out as a paragraph.
- **The fiche is interpreted at import time, away from its source.** The assistant named tips,
  split lists, and decided which free text meant which end criterion. Nobody saw those choices
  before they were saved, and two imports of one fiche could make different ones.
- **References were matched by wording.** *Coopérer*, *coopération* and *entraide* made three
  tags. Aliases were added to make up for it, which turned the catalogue into a second copy of
  the glossary. A name that matched nothing created an entry, so the catalogue drifted from it.
- **Every author ran a local server**, with an admin account's password in its configuration.

Meanwhile, the référentiels already give their entries stable identifiers, such as
`constitution-equipes` or `feu`, meant for linking a fiche to them.

## Decision

**A fiche is written as JSON where it is written.** In Confluence, an assistant writes
`activity.json` from the fiche, the glossary and
[activity.schema.json](../user/import/activity.schema.json). The schema is the contract between
the two sides; [docs/user/import](../user/import/README.md) describes it.

**An import is a zip.** It holds one folder per fiche, named after its Confluence page id, with
its `activity.json` and the files it names. An optional `glossary.json` at the root is applied
first.

**The back office imports it, from the activities list.** It reads the whole zip and checks it:
the identifiers, the files, and the cross-references between steps and the fiche's lists. The
schema itself is not validated in the browser: each file only has to say which format it is,
and the collections refuse what they cannot store. Then it shows the errors and warnings of each fiche. It writes nothing until no error is
left and the author confirms. Each fiche is then saved in one batch
([0017](0017-an-activity-is-saved-in-one-batch.md)).

**A fiche is its Confluence page id.** The activity stores it, uniquely. Importing the fiche
again updates that activity, whatever its title has become, and keeps its state.

**References are glossary identifiers, and the glossary is the source of truth.**

- A tag, a tip or a safety instruction is named by its identifier, never by its wording. For a
  tag it is its slug, and tips gain one.
- An identifier the catalogue lacks is an error, not a new entry. A new keyword reaches the app
  through `glossary.json`, which creates or updates entries by kind and identifier, and never
  deletes one.
- The aliases go: the assistant resolves the wording at the source, with the glossary's
  examples.

**Materials stay names.** The template asks for the catalogue's names "when they exist", so a
new one is created, and the check lists it as a warning.

**The MCP server goes**, with its tools, the aliases and [docs/mcp.md](../mcp.md).

## Consequences

- **The import makes no interpretation.** It looks up identifiers and files, so the same zip
  always gives the same activities. The interpretation still happens, but at the
  source, where the author sees the JSON and can correct the fiche.
- **The glossary has to list every keyword with an identifier.** Only the tips and the safety
  categories have one today. Thème and Tags pédagogiques give examples, not lists. Until they
  are listed, a fiche that uses them is refused. That is on purpose: a new keyword goes through
  the glossary first.
- **A re-import overwrites the activity**, published or not. A correction made in the back
  office is lost at the next import, so a fiche is corrected in Confluence. The steps, materials
  and workshops are replaced, and the files are uploaded again.
- **The schema holds fields the app has no column for yet**: the duration of « Rassembler le
  matériel », a step's visual file and a step's own advice. They are added with the import. The
  app keeps resources on steps, so a resource that no step names is left out, with a warning.
- **The zip is assembled by hand**, from the page's attachments and the assistant's JSON.
- **Nothing is installed, and no password sits in a configuration file.** The import runs in
  the back office, with the author's session and the collections' rules.
- **A file that strays from the schema is caught late, or loosely.** A value of the wrong kind
  is refused by the collection at save time, for that fiche only; a missing key makes the fiche
  unreadable in the check, without saying which. Validating the schema, in the browser or on the
  server, is left for when this proves too coarse.
- The browser reads the zip with `fflate`.
