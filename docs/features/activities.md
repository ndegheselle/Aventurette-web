# activities

Browsing, filtering and authoring activities.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities` | `/activities` | The list, with the filter toolbar |
| `activities.page` | `/activities/:id` | One activity in full |
| `activities.edit` | `/activities/:id/edit` | Authoring, one form |

Authoring is a single form laid out like the detail screen — properties, description, then the
steps — over the activity `useActivityEdit` loads from the route. The activity always exists by
the time the screen opens: **Add** on the list writes it first (`useActivitiesList`) and then
navigates, so there is no `new` id and no create branch in the editor. `/` redirects to
`activities`.

One composable to a screen: `useActivitiesList` holds the results, the filter criteria and the
add button; `useActivity` the detail screen; `useActivityEdit` the form and its steps; and
`useStepEdit` the materials and files inside the step modal.

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

An activity is three collections and relations are stored as ids, so nothing can be saved
before its parent exists. Rather than sequencing that at the end, **every record is written as
soon as it is added**:

| Added | Written | By |
|---|---|---|
| the activity | on **Add** on the list, before the editor opens | `useActivitiesList` |
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

Criteria are a flat form-shaped object (`ActivityCriteria`), not a query. `buildActivityFilters`
turns them into a `FilterGroup`, and that is the only place that translation happens — inside
`useActivitiesList`, next to the call that sends it. `<ActivitiesFilters>` renders the criteria
and nothing more; it is handed them as one prop.

The screen holds **two** copies of the criteria. `applied` is what the list is showing;
`draft` is what the modal's inputs are bound to. Opening the modal copies applied → draft,
confirming copies draft → applied and re-queries, cancelling copies applied → draft again.

Search is the exception: it sits outside the modal and applies as soon as it is submitted.

## Rules that hold

Four specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
or an api wrapper does not earn one — see
[ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md).

*`tests/activity.filters.spec.ts`* — the criteria-to-query translation

- Untouched criteria produce an empty query, so the list shows everything.
- Search matches `name` **or** `description`, and stays its own group so its ORs cannot widen
  the other criteria.
- `benefits` is matched with `anyEquals`, because it is a relation list; duration is bounded
  from both ends against the same field.
- The arrays are copied into the query, so editing the criteria afterwards cannot mutate a
  query already sent.
- The filter button's badge ignores age and environment, which have buttons of their own.

*`tests/activity.spec.ts`* — gathering what hangs off the steps

- Materials and resources shown for an activity are gathered from the steps that own them,
  deduplicated by id, in first-use order.

*`tests/step.spec.ts`* — suggesting a material, and the file limit

- The names offered are the distinct ones used anywhere, minus what this step already has,
  narrowed by what was typed — all matched case-insensitively, first spelling wins.
- Creating is offered only for a name that is neither already on the step nor a suggestion.
- A step takes at most `MAX_STEP_RESOURCES` (10) files. Over the limit, the files that fit are
  still taken and the rest reported — a partial pick beats dropping all of it.

*`tests/useActivityEdit.spec.ts`* — the one order that matters

- Adding a step writes a blank one and links it before the modal opens; if the link fails there
  is nothing to open.
- A removed step is unlinked **before** it is deleted, never the other way round.
- A link that cannot be written puts the list back and deletes nothing, rather than leaving the
  screen claiming a step the record does not have.
- A delete that fails after the unlink landed leaves the step off the activity anyway.

## Not finished

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
- **The age and duration inputs are `<input type="number">` bound without `.number`**, so what
  reaches `buildActivityFilters` at runtime is a string. PocketBase then compares
  `ageMin>'6'` as a string rather than a number. Adding `.number` to the four `v-model`s in
  `ActivitiesFilters.vue` is the fix; it was left alone because that pass was explicitly
  behaviour-preserving.
- The filter button's badge is an indicator, not a count — it reads `1` for any number of
  advanced criteria. `hasAdvancedCriteria` is named for what it actually is.
- Images throughout are placeholders from `placeholder.pagebee.io`.
