# activities

Browsing and filtering the public activity catalogue.

Read-only. Writing an activity is [activities-edit](activities-edit.md), which owns the editor,
the step modal and the author's own list — see
[ADR 0014](../adr/0014-authoring-is-its-own-feature.md) for why that is a second feature. What
stays here is the **shape**: `model/activity.ts`, `model/step.ts` and `api/activities.api.ts`
describe what an activity is, which both halves need, and the dependency runs one way — nothing
here imports `activities-edit`.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities` | `/activities` | The list, with the filter toolbar |
| `activities.page` | `/activities/:id` | One activity in full |

`/` redirects to `activities`.

One composable to a screen: `useActivitiesList` holds the results and the filter criteria,
`useActivity` the detail screen.

## Data

`ActivityData` is the generated `ActivitiesResponse` with its relations inlined — see
[ADR 0007](../adr/0007-relations-are-inlined-by-the-adapter.md). `activity.steps` holds the
steps themselves, each with its own `materials` and `resources`.

`ACTIVITY_RELATIONS` lists what is fetched alongside an activity, and **must** stay in step
with what `Expanded<>` declares on `ActivityData`. Its nested half is derived from
`STEP_RELATIONS`, which is also what a step is written with, so reading and writing a step
cannot drift apart.

A resource is always a record: a picked file is uploaded the moment it is chosen, so `file`
only ever holds the name of a stored file. Nothing downstream has to ask which kind it is
holding — a tile renders a url, a step is saved with ids.

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

What is left for the save button is the activity's own fields — name, description, age,
environment, duration, benefits — which is a single update, and then the detail screen.

A blank record is still a valid one: `createEmptyActivity` fills in the `description`,
`environment` and `state` the collection requires — a new activity starts as `DRAFT` — and
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

## Filtering

**A criterion is data.** `model/criteria.ts` declares what one is — a key, a label, the type of
input it takes, the values it offers and the value it holds — and `activityCriteria()` in
`model/activity.filters.ts` is the list of them the activity list can be narrowed by. Three
things are generated from that one list: the modal's fields, the chips above the list, and the
query. Adding a filter is adding an entry.

A criterion is one of three types. A `range` holds two bounds and names the record fields they
compare against — two different ones for age (`ageMin`, `ageMax`), the same one twice for
duration. `options` are a fixed set the domain declares, rendered as checkboxes, whose labels
are translation keys. `tags` are a catalogue loaded at runtime, picked from a dropdown, whose
labels are the records' own names. What each contributes to the query travels with it, which is
why `buildActivityFilters` no longer knows any field name.

The icon is the one thing a criterion does *not* carry: it is a Vue component, and `model/` may
not import the view layer. `useActivitiesList` hangs one on each criterion by key, `markRaw`'d —
a component turned into a reactive proxy is a Vue warning, and warnings fail the suite.

The screen holds **two** copies of the criteria. `applied` is what the list is showing;
`draft` is what the modal's inputs are bound to. Opening the modal copies applied → draft,
confirming copies draft → applied and re-queries, cancelling copies applied → draft again.
Choices are shared rather than copied between the two: they are what can be picked and not what
is, and `TagSelect` compares them by identity.

Search is the exception: it sits outside the modal and applies as soon as it is submitted.

Above the list sits **a chip per criterion that has a value**, reading the values themselves —
all of them, joined — rather than the criterion's name. Its cross clears that one criterion and
re-queries; the button on the right clears the lot, search included. Neither waits to be
confirmed, there being nothing left to confirm. Untouched criteria describe to nothing, so the
row collapses.

## Rules that hold

Six specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
or an api wrapper does not earn one — see
[ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md).

*`tests/criteria.spec.ts`* — what a criterion is set to, and what it reads as

- A range is set by either bound on its own, and both bounds fold into one reading.
- A pick reads as every value chosen, joined — an option through `$t`, a tag by its own name.
- A value the choices no longer hold is dropped, there being no name to show for it.
- A draft is a copy: editing it leaves what is applied alone. Clearing a criterion keeps its
  choices, which are what can be picked and not what is.
- A range contributes two filters, each against the field it was declared with; a pick
  contributes one, with the operator the criterion carries, over a copy of its values.

*`tests/activity.filters.spec.ts`* — the criteria-to-query translation

- Untouched criteria produce an empty query, so the list shows everything.
- Search matches `name` **or** `description`, and stays its own group so its ORs cannot widen
  the other criteria.
- `benefits` is matched with `anyEquals`, because it is a relation list; age is bounded against
  its two fields and duration twice against its one.

*`tests/ActivitiesFilters.spec.ts`* — the bar's wiring, which is what mounting is for

- The modal's fields are generated from the criteria, in their declared order.
- Applying a criterion shows a chip reading its values, and narrows the query.
- A chip's cross takes that criterion back out of the query.

*`tests/activity.spec.ts`* — gathering what hangs off the steps

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

- **The picture input goes nowhere.** The `activities` collection has no file field to store
  one in, so what the user picks is shown and then dropped. There is an `XXX` on it in the
  page.
- **Cancelling leaves what was already written.** A step is a record before the modal opens, so
  cancelling keeps an empty one on the activity; a file uploaded inside the modal is stored
  before the step points at it. `back/hooks` reclaims a resource no step references any more,
  but only on a step *update* — a cancel never gets that far, and neither does deleting a step,
  which leaves its resources behind the same way.
- **A step whose link could not be written stays in `activities_steps`.** It is deliberate:
  deleting it would be the safe move only if the failed update definitely did not land, and
  `cascadeDelete` makes guessing wrong expensive.
- **A range's bounds are `<input type="number">` bound without `.number`**, so what reaches
  `buildActivityFilters` at runtime is a string. PocketBase then compares `ageMin>'6'` as a
  string rather than a number. Adding `.number` to the two `v-model`s in `CriterionField.vue`
  is the fix — one place now, rather than one per range — and it fixes every range at once.
- Images throughout are placeholders from `placeholder.pagebee.io`.
