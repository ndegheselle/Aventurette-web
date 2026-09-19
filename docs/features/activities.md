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

### The attribute catalogue

An activity has almost no columns of its own: a name, a description, a state, an author, its
steps and the **groups** it belongs to. Everything a user would filter or read off it — age,
duration, environment, the developmental keywords — is an *attribute*, defined in the database
rather than in the schema. `model/attribute.ts` holds that side:

| | |
|---|---|
| `GroupData` | one of the eight groups: Général, Imaginaire, and the six developmental ones |
| `AttributeData` | a definition with its vocabulary joined on — name, slug, type, `filterable` |
| `ActivityAttributeValueData` | what one activity holds for one attribute: a number, a range, a text or one option |
| `ActivityAttributeOptionData` | one option an activity picked, for the `multi_choice` attributes |

The five types are `string`, `number`, `range`, `single_choice` and `multi_choice`. A value is
typed, not stringly: a range is two number columns, and a choice is a relation to an option.

**Adding a keyword is a row, not a release.** Seeding an attribute puts a field on the edit
form and a filter on the list without either file changing, which is the whole reason the
catalogue exists.

`useAttributes` reads it — three `cachedCrud` collections, so several components asking at once
still fetch once — and `attributesWithOptions` joins definitions to options, ordered by group
first and `sort_order` second. Sorting on `sort_order` alone interleaves the groups, every one
of them numbering its attributes from 1.

**The value rows point at the activity, not the other way round**, so the mapper reads them
through PocketBase's back-relation expand — `activity_attribute_values_via_activity` and
`activity_attribute_options_via_activity`. They arrive with the activity and `toPayload` drops
them: they are not fields of `activities`, and saving one never writes them.

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

**The mechanism is `@chapelure/ui/filter`'s; the criteria are the catalogue's.** A criterion is
data — a key, a label, an icon, the kind of input it takes, the values it offers and the value
it holds — and the package generates the modal's fields and the chips above the list from a list
of them. `activityCriteria(attributes)` builds that list from every **filterable** attribute,
one criterion per attribute, so adding a filter is seeding a row.

The attribute's type picks the input: `range` and `number` become a range, `single_choice`
checkboxes, `multi_choice` a searchable tag select. Labels are the stored names rather than
translation keys — vue-i18n renders an unknown key as itself, which is exactly the name
([ADR 0011](../adr/0011-tests-fail-on-vue-warnings.md)). The criteria are loaded, not declared,
so `useFilters` grew a `replaceCriteria` for the moment the catalogue arrives.

### Narrowing by an attribute takes two queries

An attribute's value is a **row of its own**, so one row can satisfy one criterion and never
two: `attribute='age' && attribute='domaine'` matches nothing, and PocketBase resolves every
`attributes.*` path onto one shared join, which rules out asking for both in one filter.

So the list asks for the **union** and intersects itself:

1. `buildAttributeSweep` builds one query per collection — typed values on one side, picked
   options on the other — ORing a group per criterion.
2. `activitiesMatchingAll` keeps the activities that produced a row for as many **distinct**
   attributes as were asked about. One row per activity and attribute is what the unique index
   on `(activity, attribute)` guarantees, so the count is exact.
3. `buildActivityFilters` then asks for that page of activities by id, with the search and the
   groups, and the server paginates and sorts as usual.

Narrowing by nothing but the search takes one query, and `groups` is a relation on the activity
itself, so it needs no sweep either.

Two things follow from this that are worth knowing. **Nothing matching is not a filter** —
`removeEmptyFilters` would drop an empty id list and the list would come back unfiltered — so
the composable answers that case without asking. And a sweep reads at most `SWEEP_LIMIT` (1000,
PocketBase's cap) rows, so a filter matching more than that narrows to the first 1000.

It sits in `composables/useActivitiesList.ts` and not in `model/`: a criterion names an icon,
and `model/` may not import the view layer. The icons are a slug-to-lucide map in
`composables/attributeIcons.ts`, with a fallback, so a new attribute needs no entry
([ADR 0005](../adr/0005-icons-imported-directly.md)). The three builders are pure and tested
without mounting anything.

A range is matched **inclusively** — a 6-10 activity answers "for a 10 year old" — which is why
`FilterOperator` grew `GreaterOrEquals` and `LessOrEquals`.

`useFilters` holds **two** copies of the criteria. `applied` is what the list is showing;
`draft` is what the modal's inputs are bound to. Opening the modal copies applied → draft,
confirming copies draft → applied and re-queries, cancelling copies applied → draft again.
Choices are shared rather than copied between the two: they are what can be picked and not what
is, and `TagSelect` compares them by identity. A vocabulary arrives with its attribute;
`groups` is the one criterion whose choices `setChoices` fills in separately.

Search is the exception: it sits outside the modal and applies as soon as it is submitted.

`<ActivitiesFilters>` is the bar itself, and stays here because layout does
([ADR 0004](../adr/0004-daisyui-classes-at-the-call-site.md)): a search box, a filter button, a
modal of generated fields, and **a chip per criterion that has a value**. A chip reads the
values themselves — all of them, joined — rather than the criterion's name. Its cross clears
that one criterion and re-queries; the button on the right clears the lot, search included.
Neither waits to be confirmed, there being nothing left to confirm. Untouched criteria describe
to nothing, so the row collapses.

## Rules that hold

Five specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
or an api wrapper does not earn one — see
[ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md). What a criterion *is* — its
reading, its copies, the filters it contributes — is `@chapelure/ui`'s, and tested there in
`filter/criteria.spec.ts` and `filter/useFilters.spec.ts`.

*`tests/attribute.spec.ts`* — the catalogue's own rules

- Options join to the definition that names them; attributes order by group, then `sort_order`.
- A group offers its own attributes and Général's, and never lists Général twice.
- Imaginaire's families survive as option metadata, in first-seen order.
- A value formats per type, and to null when the activity holds nothing — so a badge is skipped
  rather than rendered blank.
- `activitiesMatchingAll` counts **distinct** attributes, and matches nothing when nothing was
  asked rather than everything.

*`tests/activity.filters.spec.ts`* — the criteria-to-query translation, now in two halves

- A criterion is generated per filterable attribute and skips the rest, taking its input from
  the attribute's type.
- Search matches `name` **or** `description`, and stays its own group so its ORs cannot widen
  the other criteria.
- A range is bounded inclusively; an open bound is dropped rather than compared against nothing.
- A `multi_choice` sweeps the picks and a `single_choice` the values.
- "Nothing matched" cannot be expressed as a filter, which is why the list never sends it.

*`tests/ActivitiesFilters.spec.ts`* — the bar's wiring, which is what mounting is for

- The modal's fields are generated from the catalogue, so seeding an attribute needs no markup.
- Applying a criterion sweeps the attribute rows, then narrows the activities to what matched.
- A sweep that matched nothing issues no query at all, rather than showing everything.
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
  page. `Visuel principal` is seeded as a `string` attribute, which is not the same thing and
  not a home for a file either.
- **Selecting a group does not narrow the fields offered.** `attributesFor` implements the
  Glossaire's rule — the group's attributes plus Général's — and is tested, but no screen calls
  it: the filter modal and the edit form both offer every attribute at once. Wiring it means
  rebuilding the criteria when the group changes.
- **`Sécurité` has no vocabulary.** It is seeded as a filterable `multi_choice` with zero
  options, the Glossaire pointing at a tag referential that is not ours yet, so its filter is
  an empty dropdown.
- **A sweep reads 1000 rows at most.** Past that a filter narrows to the first 1000 matches
  and says nothing about it. The catalogue is small; the activity count is what this scales on.
- **An attribute's name and its options' labels are not translatable.** They are stored in one
  language and rendered as-is, unlike every other string in the app.
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
  string rather than a number. The fix is two `v-model`s in `@chapelure/ui`'s
  `filter/CriterionField.vue` — one place, and it fixes every range in every app at once.
- Images throughout are placeholders from `placeholder.pagebee.io`.
