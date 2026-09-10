# activities

Browsing, filtering and authoring activities. The largest feature, and the one with the most
behaviour outside its components.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities` | `/activities` | The list, with the filter toolbar |
| `activities.page` | `/activities/:id` | One activity in full |
| `activities.edit.description` | `/activities/:id/description` | Authoring, step 1 |
| `activities.edit.steps` | `/activities/:id/steps` | Authoring, step 2 |
| `activities.edit.properties` | `/activities/:id/properties` | Authoring, step 3 |

The three authoring routes are children of `pages/edit/_layout.vue`, which draws the progress
bar. `/` redirects to `activities`.

## Data

`ActivityData` is the generated `ActivitiesResponse` with its relations inlined — see
[ADR 0007](../adr/0007-relations-are-inlined-by-the-adapter.md). `activity.steps` holds the
steps themselves, each with its own `materials` and `resources`.

`ACTIVITY_RELATIONS` lists what is fetched alongside an activity, and **must** stay in step
with what `Expanded<>` declares on `ActivityData`; nothing checks the two against each other,
which is why they sit in the same file.

A step's resources are of two kinds at once. A saved one is a record whose `file` is the name
of a stored file; one the user just picked has no record yet, so its `file` is the `File`
itself. `isUploadedResource` tells them apart, and everything that renders or keys a resource
goes through it.

## Filtering

The one piece worth reading before changing anything here.

Criteria are a flat form-shaped object (`ActivityCriteria`), not a query. `buildActivityFilters`
turns them into a `FilterGroup`, and that is the only place that translation happens.

The toolbar holds **two** copies of the criteria. `applied` is what the list is showing;
`draft` is what the modal's inputs are bound to. Opening the modal copies applied → draft,
confirming copies draft → applied and re-queries, cancelling copies applied → draft again.
Without the split, typing in the modal and then cancelling would still have re-queried.

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

*State — `composables/useActivityFilters.spec.ts`, `composables/useActivitiesList.spec.ts`*

- Editing the modal does not re-query; confirming does; cancelling restores what was applied.
- Reset empties the inputs and leaves the list alone until the user confirms.
- The benefit tag input works in records while the criteria hold ids; the composable translates.
- Re-querying keeps the current page, so paging does not reset itself.

*Screen — `components/activities/ActivitiesFilters.spec.ts`, `components/resources/ResourcesSelection.spec.ts`*

- The toolbar shows the applied age range on its own button.
- The filter button is badged only for criteria no other button displays.
- A picked file joins the model rather than the component's own state, because the step is what
  gets saved and the file has to travel with it.

## Not finished

- **The authoring flow does not save.** `Step2Steps` builds a list of steps in memory; there is
  no save at the end of step 3, and existing steps are not seeded into the editor when an
  activity is reopened. There is an `XXX` on it in the page.
- **The age and duration inputs are `<input type="number">` bound without `.number`**, so what
  reaches `buildActivityFilters` at runtime is a string. PocketBase then compares
  `ageMin>'6'` as a string rather than a number. Adding `.number` to the four `v-model`s in
  `ActivitiesFilters.vue` is the fix; it was left alone because that pass was explicitly
  behaviour-preserving.
- The filter button's badge is an indicator, not a count — it reads `1` for any number of
  advanced criteria. `hasAdvancedCriteria` is named for what it actually is.
- Images throughout are placeholders from `placeholder.pagebee.io`.
