# 0026. Fiches are imported from a zip, written as JSON at the source

Status: Accepted. It replaces the MCP server that saved a fiche, and the catalogue aliases that
came with it (the former 0027), then the import the back office ran in the browser. Where
[0017](0017-an-activity-is-saved-in-one-batch.md) and
[0018](0018-safety-instructions-and-tips-are-catalogues.md) say "the import", read this one: it
links tips and safety instructions by identifier, not by name, and writes on the server.

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

**The server imports it, in one call.** The back office sends the zip to
`POST /api/activities/import`, from the activities list. The route refuses anyone but an admin
before it reads the zip. Then it checks the whole zip: the identifiers, the files, and the
cross-references between steps and the fiche's lists. Each value must have its schema's type; the
schema itself is not validated otherwise, and the collections refuse what they cannot store.
When no problem is an error, it writes the glossary and every fiche in one transaction. Either
way, it answers with the errors and warnings of each fiche, and whether the zip was written.

The browser used to do all of this, with a check before a confirmed import. The rules lived in
TypeScript, each fiche was its own batch, and the zip was read twice over HTTP: once to check,
once to upload its files. On the server, the rules sit next to the collections they write, one
refused write undoes the whole zip, and any client can call the route.

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
- **Nothing is installed, and no password sits in a configuration file.** The import runs with
  the author's session, and the route checks the role itself: it writes as the server, past the
  collections' rules.
- **An import is all or nothing.** Warnings do not stop it; an error, or a write a collection
  refuses, leaves the database as it was. The refusal is reported against its fiche.
- **There is no confirmation step.** The author picks the zip and imports it; a zip with an error
  only gets its report back. A warning is read after the import, and fixed by a new one.
- **A file that strays from the schema is caught loosely.** A value of the wrong type is
  reported with its key. A missing key reads as its empty value. Validating the schema fully is
  left for when this proves too coarse.
- **The zip is limited to 128 MB**, past PocketBase's default 32 MB: it holds the pictures.
- The code is in `backend/api/importer`, and its tests are Go tests.
