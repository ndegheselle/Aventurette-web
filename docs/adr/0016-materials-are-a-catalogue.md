# 0016 — Materials are a catalogue, and an activity links what it needs

**Status:** Accepted

## Context

A material belonged to one activity: one row per activity and name in `activities_materials`,
with the quantity on it. Two activities needing a rope were two ropes, and the editor could only
*suggest* names used elsewhere, deduplicating them case-insensitively on every read. Nothing
could rename or correct a material everywhere at once, and nothing cleaned up a row once no
activity listed it.

The quantity is what stopped the rows being shared: "one per team" in one activity is "2" in
another, so a row shared by both would have to hold one quantity for two needs.

## Decision

**`materials` is the catalogue**: one row per name, a unique index on `name COLLATE NOCASE`
refusing a second spelling of the same one. It holds the name and nothing an activity decides.

**`activities_materials` is what an activity needs of it**: a link carrying `activity`,
`material` and the `quantity`. Both relations cascade, so deleting an activity or a catalogue
material deletes the links to it.

**The activity's `materials`, and each step's and workshop's, point at the links**, not at the
catalogue. None of them cascades, so deleting a link — taking a material off an activity — is
one call, and PocketBase drops it from the activity's list and from every step and workshop
that recalled it. The client writes nothing else.

In the front, the link is `ActivityMaterialData`, with the catalogue material's `name` folded
in by `activityMaterialMapper` so that a list of what an activity needs reads as one list, and
the pickers bind `name` as before. The name is read only: it never goes back on a write. The
catalogue row is `MaterialData`. Both types, and both mappers, sit with the other shapes in
`activities/`.

Migration `1790760000_materials_catalogue.go` renamed the old collection, merged its rows by name
(case-insensitively, the first spelling an activity lists kept), and gave each activity one link
per material, carrying its old quantity. A step or workshop recalling a material its activity's
list had lost gets a link too, so nothing it recalled is lost. The rollback gives each link a
row of its own again.

## Consequences

- A material is named once. The `materials-authoring` screen renames it or deletes it
  everywhere, and the editor offers the catalogue itself rather than names rebuilt from rows.
- Removing a material from an activity is one delete, and the steps and workshops follow on the
  backend. Deleting a catalogue material reaches every activity using it, which is why that
  screen warns before it deletes.
- A link's name is only as fresh as its read: renaming in the catalogue shows in an open editor
  after it reloads.
- Nothing checks that a step recalls only links of its own activity. The editor only offers
  those, and the migration only made those, but the schema would accept another activity's.
- An unused catalogue material stays. That is the point of a catalogue, but nothing lists which
  ones no activity uses.
