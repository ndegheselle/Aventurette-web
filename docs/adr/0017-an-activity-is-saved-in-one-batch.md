# 0017 — An activity is saved in one batch, everything under it included

**Status:** Accepted

## Context

An activity is several collections: the activity, its material links, its steps and their
files, its workshops, and the catalogue names it adds. Relations are stored as ids, so a record
can only be written once the records it points at exist.

The editor used to get around that by writing every record the moment it was added: the
activity on **Add** in the list, a blank step before its modal opened, a file as it was picked,
a link as a material was chosen. Every modal only ever updated, and each write was simple
because it touched one record.

The cost was what that left in the database. A new activity existed before its author typed a
name, a cancelled step modal left an empty step behind, a file was stored before any step
pointed at it, and a failure part way through an import had to be undone by deleting the
activity and trusting the cascades. Nothing was ever *partially written*, but plenty was
*written partial*.

The other way round — keep everything in memory and write it on save — was held back by one
thing: knowing what to create, update and delete, and in which order, so that every write
points at records that already exist and no delete cascades onto the activity.

## Decision

**Nothing under an activity is written before its save.** The editor and the import hold the
whole activity in memory, new records included. **The save is one PocketBase batch**
(`/api/batch`), which runs its writes in order inside one transaction: they all land, or none
does. Migration `1790840000_batch_writes.go` turns batching on, which PocketBase ships without.

**New records get their ids from the client** (`newId`, PocketBase's own `[a-z0-9]{15}` format),
when they are added. That is what lets one batch create a step and, further down, the activity
listing it, and lets a step's materials recall a link created in the same save.

**What to write is a pure function**, `activityWrites(original, edited)` in
`model/activity.edit.ts`. It compares the activity as it was read with the activity as the form
holds it, by id: what `original` lacks is created, what `edited` lacks is deleted, what changed
is updated. It also fixes the order:

1. new catalogue names, then the activity itself when it is new, bare;
2. material links; new steps, without their files; the files; then the steps listing them;
3. workshops;
4. the activity's own update, its lists naming every record above;
5. the deletes, once the activity no longer lists them — `activities.steps` cascades onto the
   activity when a still-listed last step is deleted.

`@chapelure/core` gains the port, `IDataBatch`, with `BatchError` saying which write failed;
`@chapelure/pocketbase` implements it. `saveErrors` puts a refused activity write's errors on its
fields, and any other record's under the list that holds it.

The modals edit a copy and hand it back (`useDraftModal`, in `@chapelure/ui`), checking only
what the backend would refuse in them — a step's description, a workshop's name — so the
failure shows against the field rather than as a refused save.

## Consequences

- Leaving the editor writes nothing, and a failed save leaves what was stored before it.
  Cancelling a modal leaves nothing behind. A new activity exists from its first save.
- The import takes the same path, so it is all-or-nothing by transaction rather than by a
  compensating delete.
- **Unsaved work is lost when the editor is left.** Steps, files and materials used to be
  stored as they were added; now they wait for the save button, and nothing warns before
  navigating away.
- A save sends everything at once, files included, so it is as slow as its uploads, and it is
  bounded by the batch limits set in the migration (300 writes, 30 seconds).
- "Changed" is a JSON comparison of a record with its read copy. A false positive costs a
  write, never a lost change.
- A refused write that is not the activity's points at a list, not at a field: the form has no
  input for a step's title once its modal is closed.
- `useEditModal`, which saved a record from its modal, no longer has a caller in the app.
