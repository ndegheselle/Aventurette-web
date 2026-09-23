# activities

Browsing and filtering the public activity catalogue.

Read-only. Writing an activity is [activities-edit](activities-edit.md), which owns the editor,
the step modal and the author's own list. What stays here is the **shape**: `model/activity.ts`
and `model/step.ts`, their mappers in `api/`, and `api/activities.api.ts` describe what an
activity is — which both halves need — and the dependency runs one way: nothing here imports
`activities-edit`.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities` | `/activities` | The list, with the filter toolbar |
| `activities.page` | `/activities/:id` | One activity in full |

`/` redirects to `activities`.

One composable to a screen: `useActivitiesList` holds the results and the filter criteria,
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

## Filtering

**The mechanism is `@chapelure/ui/filter`'s; the criteria are this screen's.** A criterion is
data — a key, a label, an icon, the kind of input it takes, the values it offers and the value
it holds — and the package generates the modal's fields and the chips above the list from a list
of them. `activityCriteria()` declares sixteen, each naming a column or a relation of
`activities`:

| | |
|---|---|
| `range` | age, the number of children, the number of leaders |
| `options` | environnement, saison, météo, niveau d'énergie — `select` columns, so a fixed set |
| `tags` | Domaine, Imaginaire, Sécurité and the six developmental axes — the referentials |

**Adding a filter means editing that function**, which is the trade the column model made: the
catalogue this replaced generated its criteria from seeded rows, so a filter appeared without a
release — and cost two queries to answer. Now one query answers the whole form.

### A range matches by overlap

The bounds a user gives are compared against the **opposite** ends of what is stored: the
activity's `age_max` has to reach the asked-for minimum, and its `age_min` must not run past the
asked-for maximum. Inclusive on both sides, so a 6-10 activity answers "for a 10 year old" —
which is what `GreaterOrEquals` and `LessOrEquals` exist for.

A single column bounded from both ends — the leader count — declares itself as *both* `minField`
and `maxField` and falls out of the same two comparisons, so `criterionFilters` has one rule
rather than two.

Untouched criteria contribute filters with no value, and `removeEmptyFilters` drops them. So
nothing branches on "not set", and an untouched form asks for everything. An open bound is
dropped the same way, which is also why a minimum of `0` reads as no minimum.

### A long vocabulary collapses

An `options` criterion renders every choice as a checkbox, and environnement seeds fourteen of
them — enough to push the next field off screen. Past `COLLAPSED_CHOICES` (6) the list is cut and
the rest go behind a **Show more** button; météo and niveau d'énergie are shorter and stay whole.
It is `@chapelure/ui`'s, not this feature's: the form is generated, so the field that renders it
is the only place that knows how many choices there are.

**Collapsing never hides a pick.** Opening the modal rebinds each field to a fresh clone of what
the list is showing, and `collapseHidesPick` opens any criterion whose applied values sit past
the fold. Without it a user would reopen the filter, see the box unticked because it was cut off,
and clear a filter they never touched by confirming the form.

`tags` criteria are unaffected — a referential is a searchable dropdown, not a checkbox list.

### The referentials arrive late

The `tags` criteria have nothing to offer until their rows do. `useReferentials` reads all nine
— `cachedCrud`, so nine requests the first time and none after — and replaces its map once, when
the lot has arrived, rather than nine times. `referentialChoices` then turns rows into choices in
the locale on screen and `setChoices` fills them in.

The criteria themselves are **declared, not loaded**, so the form is complete from the first
paint; only the dropdowns fill in. A label is the row's own wording rather than a translation
key, which is why `describeCriterion` renders a `tags` chip as-is and an `options` chip through
`t`.

`<ActivitiesFilters>` is the bar itself, and stays here because layout does
([ADR 0004](../adr/0004-daisyui-classes-at-the-call-site.md)): a search box, a filter button, a
modal of generated fields, and **a chip per criterion that has a value**. A chip reads the
values themselves — all of them, joined — rather than the criterion's name. Its cross clears
that one criterion and re-queries; the button on the right clears the lot, search included.
Neither waits to be confirmed, there being nothing left to confirm. Untouched criteria describe
to nothing, so the row collapses.

`useFilters` holds **two** copies of the criteria. `applied` is what the list is showing;
`draft` is what the modal's inputs are bound to. Opening the modal copies applied → draft,
confirming copies draft → applied and re-queries, cancelling copies applied → draft again.

Search is the exception: it sits outside the modal and applies as soon as it is submitted.

## Rules that hold

Four specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
or an api wrapper does not earn one — see
[ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md). What a criterion *is* — its
reading, its copies, the filters it contributes — is `@chapelure/ui`'s, and tested there in
`filter/criteria.spec.ts` and `filter/useFilters.spec.ts`.

*`tests/activity.filters.spec.ts`* — the criteria, and the query they translate to

- A criterion is offered per column and relation, taking its input from what the column holds.
- A range matches by **overlap** and inclusively, so an activity whose range ends on the bound
  still counts; an open bound is dropped rather than compared against nothing.
- A single column declared as both fields is bounded from both ends.
- A pick matches its own field with `anyEquals`, and its values are copied in so editing the
  criterion cannot mutate a query already sent.
- Search matches `name` **or** `description` and stays its own group, so its ORs cannot widen
  the other criteria.
- Every set criterion goes in one query.
- A referential's choices read in the locale on screen, falling back to French.

*`@chapelure/ui/filter/criteria.spec.ts`* — the fold, which is the package's

- A long list is cut to `COLLAPSED_CHOICES` and whole once expanded; a short one is never cut.
- The hidden count is what decides whether a button is offered at all.
- Collapsing reports that it would hide a pick, which is what reopens the criterion.

*`tests/referential.spec.ts`* — reading a seeded wording

- The locale asked for, then French, then the empty string — never the text "undefined".

*`tests/ActivitiesFilters.spec.ts`* — the bar's wiring, which is what mounting is for

- A field is generated per criterion, named by the column it narrows.
- A chip reads the values applied rather than the criterion holding them, and its cross takes
  that criterion back out of the query.
- A referential fills its dropdown in once its rows arrive.
- A long vocabulary is cut down and offers the rest behind a button, which expands and collapses
  it; a short one gets no button.
- A criterion reopens expanded when what is applied sits past the fold.

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

- **The list filters on columns the form cannot set and the list does not show.** The filter
  bar reads every one of them, but the editor has no field for age, participants, season or any
  referential, and neither the list nor the detail screen shows a badge for them. Filtering on
  what nobody can enter yet is the order the work happened in, not the order it should stay in.
- **No filter for preparation or playing time.** The Glossaire asks for both; `activities` has
  no column for either, so there is nothing to narrow.
- **A referential's wordings are stored, not translated from a key.** `name` (and Sécurité's
  `description`) is a JSON object holding one entry per locale — `{"fr": …, "en": …}` — because a
  seeded row cannot live in a feature's `locales/`. `wordingIn` picks the locale out of it with
  `fr` as the fallback. Switching language does **not** relabel the choices already on screen:
  they are filled in once, when the rows arrive.
- **The referentials are readable by anyone**, like `activities` and `activities_steps`. They
  hold the seeded Glossaire and nothing a user owns, and writing them is still superuser-only —
  but it is a wider rule than "signed in", which is what the rest of the app assumes.
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
