# 0026. New activities are saved through an MCP server

Status: Accepted. It replaces the back office's import modal. Where
[0017](0017-an-activity-is-saved-in-one-batch.md) and
[0018](0018-safety-instructions-and-tips-are-catalogues.md) say "the import", read the MCP
server's `save_activity`.

## Context

Ajil's team writes each activity as a fiche in Markdown, from a Confluence template. Getting a
fiche into the app took three steps. First, a Claude skill (`fiche-to-json`) turned the Markdown
into a JSON file. Then the authoring list's import modal read that file. Last, the author linked
the names that matched nothing, picked the files and saved.

The JSON file was only an intermediate format. Each step lost things on the way: the modal could
not create a missing tip or safety instruction, and resources had to be picked again by hand.
An assistant that reads the fiche can do all of that itself, if it can write to the backend.

## Decision

**A local MCP server saves a fiche as a draft.** The author asks Claude to save the fiche. Claude
maps it to a sheet and calls `save_activity`, which writes the draft in one batch and answers with
the editor link and what is left to do. The author then corrects the draft in the editor.

- **It is a second entry point of the back office**: `frontend/admin/src/mcp/`, next to `app/`,
  built for Node by `npm run build:mcp`. It reuses the features' `models/` and `api/` as they
  are, so no code moves to a shared package. Its tools live in each feature's `mcp/` folder,
  which has the same role `ui/` has for the browser. `lint:arch` keeps Vue out of both.
- **It signs in as an admin**, with an email and a password from its environment, and stops if
  the account is not one. The collections' rules are what really protects the data: any write
  from another account is refused anyway.
- **The sheet's format is `mcp/activity-sheet.schema.json`**, passed as is as the tool's input
  schema. `readActivitySheet` still checks it, since the input comes from outside the app.
- **Tags, safety instructions and tips that match nothing are created**, each in its own kind,
  and the answer lists them for the author to check. Tags were only linked at first, as a
  curated list; but the catalogue started empty, and the fiches already write the reference
  vocabulary, so a first import linked no tag at all and left about fifty to pick by hand.
- The import modal, its composable and the skill are removed.

## Consequences

- Getting a fiche into the app is one request to Claude, files included: they are read from the
  author's disk by path.
- **The created tags, safety instructions and tips are outside the activity's batch.** If the
  save fails after creating them, they stay. That is harmless, because the next save matches them
  by name instead of creating them again.
- **A misspelt tag becomes a second tag.** Nothing tells *Coopération* from *Cooperation*: the
  author merges them in the catalogue, from the list the answer gives.
- The PocketBase adapter can keep its session in memory (`initPocketBase(url, { session:
  'memory' })`), since Node has no browser storage.
- Each author installs the server locally: a build from this repository, and an entry in their
  MCP client's configuration ([docs/mcp.md](../mcp.md)). A server hosted for everyone would need
  an OAuth sign-in, which PocketBase does not provide.
- The session is not refreshed. After 7 days, restart the client.
