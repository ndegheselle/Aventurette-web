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
the time the screen opens: **Add** on the list writes it first (`useNewActivity`) and then
navigates, so there is no `new` id and no create branch in the editor. `/` redirects to
`activities`.

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
| the activity | on **Add** on the list, before the editor opens | `useNewActivity` |
| a step, blank, and its link to the activity | on **Add** in the steps panel, before the modal opens | `useActivityEdit.addStep` |
| a file | as it is picked | `useStepResources` |
| the step's own content | as the modal is confirmed | `StepEdit.modal` (`useEditModal`) |

Nothing is ever created from a modal: what it opens on already exists, so it only updates, and
the materials and files chosen in it have a record to belong to.

What is left for the save button is the activity's own fields — name, description, age,
environment, duration, benefits — which is a single update, and then the detail screen.

A blank record is still a valid one: `createEmptyActivity` fills in the `description`,
`environment` and `state` the collection requires — a new activity starts as `DRAFT` — and
`useNewActivity` adds the placeholder name and the owner from the session. `createEmptyStep`
does the same for the one field a step must have. Materials are picked from a reference collection, so there is nothing
to create for them — the step's link is what gets saved.

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
turns them into a `FilterGroup`, and that is the only place that translation happens.

The toolbar holds **two** copies of the criteria. `applied` is what the list is showing;
`draft` is what the modal's inputs are bound to. Opening the modal copies applied → draft,
confirming copies draft → applied and re-queries, cancelling copies applied → draft again.

Search is the exception: it sits outside the modal and applies as soon as it is submitted.

## Rules that hold

*Model — `model/filters.spec.ts`, `model/activity.spec.ts`, `model/resource.spec.ts`*

- Untouched criteria produce an empty query, so the list shows everything.
- Search matches `name` **or** `description`, and stays its own group so its ORs cannot widen
  the other criteria.
- `benefits` is matched with `anyEquals`, because it is a relation list.
- The arrays are copied into the query, so editing the criteria afterwards cannot mutate a
  query already sent.
- Materials and resources shown for an activity are gathered from the steps that own them,
  deduplicated by id, in first-use order.
- A step takes at most `MAX_STEP_RESOURCES` (10) files. Over the limit, the files that fit are
  still taken and the rest reported — a partial pick beats dropping all of it.
- A blank activity carries what the collection requires, so it can be created before it is
  filled in.

*Authoring — `composables/useNewActivity.spec.ts`, `composables/useActivityEdit.spec.ts`,
`composables/useStepResources.spec.ts`*

- Adding an activity writes it, owned by the signed-in user, and opens the editor on what was
  written; a rejected create leaves the user on the list.
- An id the backend does not know leaves a blank activity for the form to bind to, not a null.
- A picked file is uploaded there and then; over the limit, only what fits goes up.
- Adding a step writes a blank one and links it before the modal opens; if the link fails there
  is nothing to open, and an edited step is taken in without a second write.
- A removed step is unlinked **before** it is deleted, and a link that cannot be written puts
  the list back rather than leaving the screen claiming a step it does not have.
- A rejected write stays on the form and reports itself against the field that caused it.

*State — `composables/useActivityFilters.spec.ts`, `composables/useActivitiesList.spec.ts`*

- Editing the modal does not re-query; confirming does; cancelling restores what was applied.
- Reset empties the inputs and leaves the list alone until the user confirms.
- The benefit tag input works in records while the criteria hold ids; the composable translates.
- Re-querying keeps the current page, so paging does not reset itself.

*Screen — `components/activities/ActivitiesFilters.spec.ts`, `components/resources/ResourcesSelection.spec.ts`*

- The toolbar shows the applied age range on its own button.
- The filter button is badged only for criteria no other button displays.
- The record a picked file was uploaded as joins the step's model, not the component's own
  state, because the step is what points at it.

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
