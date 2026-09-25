# activities

Browsing the public activity catalogue.

Read-only. Writing an activity is [activities-edit](activities-edit.md), which owns the editor,
the step modal and the author's own list. What stays here is the **shape**: `model/activity.ts`
and `model/step.ts`, their mappers in `api/`, and `api/activities.api.ts` describe what an
activity is — which both halves need — and the dependency runs one way: nothing here imports
`activities-edit`.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities` | `/activities` | The list |
| `activities.page` | `/activities/:id` | One activity in full |

`/` redirects to `activities`.

One composable to a screen: `useActivitiesList` holds the results,
`useActivity` the detail screen.

## Data

Two types to an entity: `ActivityData` in `model/activity.ts` is what the app uses,
`ActivityPayload` in `api/activity.mapper.ts` is what the backend sends, and `activityMapper`
beside it is the only thing that holds both — see
[ADR 0007](../adr/0007-models-map-their-own-payloads.md). `activity.steps` holds the steps
themselves, each with its own `materials` and `resources`.

`activityMapper.relations` lists what is fetched alongside an activity; the nested half is
derived from `stepMapper.relations`, so a step arrives the same way whether it is read on its
own or under an activity. A relation the read did not expand maps to an empty list, never to
the ids the record carries.

`activity.tags` holds ids into `activities_tags`: the domains, imaginary universes, safety tags
and developmental keywords, told apart by `type`
([ADR 0017](../adr/0017-activity-tags-are-one-collection.md)). Nothing reads them yet, so
`activityMapper` does not expand them.

A resource is always a record: a picked file is uploaded the moment it is chosen. On the wire
`file` is the upload going up and the stored name coming back, and `resourceMapper` turns that
name into `resource.url` — so a tile renders a url and a step is saved with ids, and neither
has to ask which it is holding.

## Saving

Nothing on these two screens writes. What follows describes how the editor in
[activities-edit](activities-edit.md) persists what this feature then reads back, because it is
the reason `ActivityData` has the shape it does.

An activity is three collections and relations are stored as ids, so nothing can be saved
before its parent exists. Rather than sequencing that at the end, **every record is written as
soon as it is added**:

| Added | Written | By |
|---|---|---|
| the activity | on **Add** on the authoring list, before the editor opens | `useActivitiesEditList` |
| a step, blank, and its link to the activity | on **Add** in the steps panel, before the modal opens | `useActivityEdit.addStep` |
| a file | as it is picked | `useStepEdit` |
| the step's own content | as the modal is confirmed | `StepEdit.modal` (`useEditModal`) |

Nothing is ever created from a modal: what it opens on already exists, so it only updates, and
the materials and files chosen in it have a record to belong to.

What is left for the save button is the activity's own fields — name, description — which is a
single update, and then the detail screen.

A blank record is still a valid one: `createEmptyActivity` fills in the `description` and
`state` the collection requires — a new activity starts as `DRAFT` — and
`useActivitiesList` adds the placeholder name and the owner from the session. `createEmptyStep`
does the same for the one field a step must have. A material is **not** picked from a reference
collection: it belongs to one step, so choosing a name writes a row of that step's own and the
names already used elsewhere are only suggestions.

**Deleting a step means unlinking it first.** `activities.steps` has `cascadeDelete` on, which
in PocketBase deletes the record *holding* the relation once the deleted id leaves it with no
references left — so deleting an activity's last step takes the activity with it. `detachStep`
writes the shortened list, and only then removes the record, which also keeps the one-step case
from being a special case.

A rejected write comes back as `ValidationError` and is shown against the field that caused it
— see `useSubmit` in @chapelure/ui. A failed relation write is reported as an alert and the
list is put back to what the record still holds, because no field on the form stands for it.

## Rules that hold

Two specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
or an api wrapper does not earn one — see
[ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md).

*`tests/activity.spec.ts`* — the mapper, and gathering what hangs off the steps

- `activityMapper` asks for the nested relations a step needs, inlines them down to the file
  urls, and reads a relation the request did not expand as empty rather than as ids.
- Relations are written back as ids: saving an activity links its steps, it does not save them.
- Materials and resources shown for an activity are gathered from the steps that own them,
  deduplicated by id, in first-use order.

*`tests/step.spec.ts`* — suggesting a material, and the file limit

- The names offered are the distinct ones used anywhere, minus what this step already has,
  narrowed by what was typed — all matched case-insensitively, first spelling wins.
- Creating is offered only for a name that is neither already on the step nor a suggestion.
- A step takes at most `MAX_STEP_RESOURCES` (10) files. Over the limit, the files that fit are
  still taken and the rest reported — a partial pick beats dropping all of it.

*`activities-edit/tests/useActivityEdit.spec.ts`* — the one order that matters, and the one
spec that moved out with the composable it covers

- Adding a step writes a blank one and links it before the modal opens; if the link fails there
  is nothing to open.
- A removed step is unlinked **before** it is deleted, never the other way round.
- A link that cannot be written puts the list back and deletes nothing, rather than leaving the
  screen claiming a step the record does not have.
- A delete that fails after the unlink landed leaves the step off the activity anyway.

## Not finished

Most of what follows is the editor's, and is listed here because it is about this feature's
data. [activities-edit](activities-edit.md) has the gaps that belong to its screens.

- **The list cannot be filtered or searched.** The filter bar was removed; every page lists
  every activity. The tags it would filter on are in `activities_tags`.
- **The picture input goes nowhere.** The `activities` collection has no file field to store
  one in, so what the user picks is shown and then dropped. There is an `XXX` on it in the page.
- **Cancelling leaves what was already written.** A step is a record before the modal opens, so
  cancelling keeps an empty one on the activity; a file uploaded inside the modal is stored
  before the step points at it. `back/hooks` reclaims a resource no step references any more,
  but only on a step *update* — a cancel never gets that far, and neither does deleting a step,
  which leaves its resources behind the same way.
- **A step whose link could not be written stays in `activities_steps`.** It is deliberate:
  deleting it would be the safe move only if the failed update definitely did not land, and
  `cascadeDelete` makes guessing wrong expensive.
- Images throughout are placeholders from `placeholder.pagebee.io`.
