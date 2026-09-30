# activities

Browsing the public activity catalogue.

Read-only. Writing an activity is [activities-authoring](activities-authoring.md), which owns the
editor, the step and workshop modals, the author's own list and the rules for writing. What
stays here is the **shape**: `model/activity.ts`, `model/step.ts`, `model/material.ts`,
`model/workshop.ts` and `model/tag.ts`, their mappers in `api/`, and `api/activities.api.ts`
describe what an activity is — which both halves need — and the
dependency runs one way: nothing here imports `activities-authoring`.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities` | `/activities` | The list |
| `activities.page` | `/activities/:id` | One activity in full |

`/` redirects to `activities`.

One composable to a screen: `useActivitiesList` holds the results and the search,
`useActivity` the detail screen.

## Data

Two types to an entity: `ActivityData` in `model/activity.ts` is what the app uses,
`ActivityPayload` in `api/activity.mapper.ts` is what the backend sends, and `activityMapper`
beside it is the only thing that holds both — see
[ADR 0007](../adr/0007-models-map-their-own-payloads.md).

**The activity is grouped by family**
([ADR 0015](../adr/0015-activity-attributes-grouped-by-family.md)), the way the activity sheet
template reads. What identifies it sits at the top: `name`, `description`, `state`, `user`,
`visual`, `visualBrief`. The rest sits under `classification`, `imaginary`, `audience`,
`supervision`, `place`, `safety` and `pedagogy`. The columns stay flat. The mapper builds the
families on read and flattens them on write. An unset single choice is the empty string
PocketBase stores, and is typed that way.

`activity.steps`, `activity.materials` and `activity.workshops` hold the records themselves.
`activityMapper.relations` lists what is fetched alongside an activity. The nested halves are
derived from `stepMapper.relations` and `workshopMapper.relations`, so a step arrives the same
way whether it is read on its own or under an activity. A relation the read did not expand maps
to an empty list, never to the ids the record carries.

**Materials come from a catalogue** ([ADR 0016](../adr/0016-materials-are-a-catalogue.md)).
`materials` holds one row per name, and `activities_materials` holds what an activity needs of
one: a link with a free-text `quantity` ("one per team" is a quantity too). `activity.materials`
is those links, as `ActivityMaterialData`, with the catalogue material's `name` folded in by
`activityMaterialMapper`. A step or a workshop *recalls* the links it uses and owns none. None
of those lists cascades, so deleting a link only drops it from the lists holding it. Both the
link's relations do cascade: deleting an activity, or a catalogue material, deletes its links.

**A step** has a `kind`: preparing the game, explaining, forming teams, starting, a free step,
announcing the end or concluding. It also has a `title`, an estimated `duration` in minutes, the
brief of its one visual, the `actions` to tick (a JSON list of strings) and a `tip`. The step
announcing the end also has `end_criteria` and `end_criteria_other`. `timingOf` sums the
durations: preparation is the steps preparing the game, play is every other step.

**A workshop** is one of the stations an activity runs in parallel. It has a name, a theme, its
challenges, the materials it recalls and the adults it takes to hold it.

Tags all live in `tags`, and an activity links them through one relation per place
([ADR 0014](../adr/0014-activity-tags-are-one-collection.md)): `theme_tags` into
`classification.themes`, `imaginary_tags` into `imaginary.universes`, `safety_tags` into
`safety.tags`, and `goal_tags`, `ideal_for_tags` and `development_tags` into `pedagogy`. The six
development axes share their relation, and the mapper sorts them apart by kind. A backend hook
refuses a tag linked in a relation not meant for its kind. `name` and `description` are in one
language, French, whatever locale the app is showing. `tagOptions` in `model/tag.ts` groups
every tag by kind for the editor's pickers.

A resource is always a record: a picked file is uploaded the moment it is chosen. On the wire
`file` is the upload going up and the stored name coming back, and `resourceMapper` turns that
name into `resource.url` — so a tile renders a url and a step is saved with ids, and neither
has to ask which it is holding. Resources still hang off the steps, and `resourcesOf` gathers
them for the activity.

## Saving

Nothing on these two screens writes. What follows describes how the editor in
[activities-authoring](activities-authoring.md) persists what this feature then reads back, because it is
the reason `ActivityData` has the shape it does.

An activity is several collections and relations are stored as ids, so nothing can be saved
before its parent exists. Rather than sequencing that at the end, **every record is written as
soon as it is added**:

| Added | Written | By |
|---|---|---|
| the activity | on **Add** on the authoring list, before the editor opens | `useActivitiesEditList` |
| a step, blank, and its link to the activity | on **Add** in the steps panel, before the modal opens | `useActivityEdit.addStep` |
| a file | as it is picked | `useStepEdit` |
| the step's own content | as the modal is confirmed | `StepEdit.modal` (`useEditModal`) |
| a material's link to the activity, and a new catalogue name first if one was typed | as it is chosen | `useActivityEdit.addMaterial`, `useMaterialCatalogue.create` |
| a material's quantity | as it is typed | `useActivityEdit.updateMaterial` |
| a workshop, blank, and its link | on **Add** in the workshops panel, before the modal opens | `useActivityEdit.addWorkshop` |
| the workshop's own content | as the modal is confirmed | `WorkshopEdit.modal` (`useEditModal`) |

Nothing is ever created from a modal: what it opens on already exists, so it only updates, and
the files chosen in it have a record to belong to.

What is left for the save button is the activity's own fields: every family, its description
and which tags it carries. That is a single update, and then the detail screen. A tag is
reference data: picking one links a row that already exists, so nothing is written until save.
An update carries a family whole, tag relations included, or leaves it out.

A blank record is still a valid one: `createEmptyActivity` fills in every family, and the
`description` and `state` the collection requires — a new activity starts as `DRAFT` — and
`useActivitiesEditList` adds the placeholder name and the owner from the session.
`createEmptyStep` does the same for the two fields a step must have, `description` and `kind`,
and `createEmptyWorkshop` for a workshop's name. They are the authoring feature's.

A material **is** picked from a reference collection, the catalogue, but unlike a tag the
pick is written at once: it is a link of the activity's own, carrying the quantity. Should the
activity's list fail to take the link, the link is deleted again. **Taking a material off is one
call**, the link's delete: the backend drops it from the activity's list and from every step and
workshop recalling it. `withoutMaterial` then takes it off the steps and workshops held in
memory too, or their next save would send the dead id back and be refused. A workshop is
deleted in one call for the same reason.

**Deleting a step means unlinking it first.** `activities.steps` has `cascadeDelete` on, which
in PocketBase deletes the record *holding* the relation once the deleted id leaves it with no
references left — so deleting an activity's last step takes the activity with it. `detachStep`
writes the shortened list, and only then removes the record, which also keeps the one-step case
from being a special case.

A rejected write comes back as `ValidationError` and is shown against the field that caused it
— see `useSubmit` in @chapelure/ui. A failed relation write is reported as an alert and the
list is put back to what the record still holds, because no field on the form stands for it.

## Rules that hold

Four specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
or an api wrapper does not earn one — see
[ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md).

*`tests/activity.spec.ts`* — the mapper, the durations and the range bounds

- `activityMapper` asks for the nested relations steps, material links and workshops need, and
  every tag relation. It
  inlines them down to the file urls, and reads a relation the request did not expand as empty
  rather than as ids.
- Columns are grouped by family on read and flattened back on write. Each tag relation is read
  into its family; the development axes are sorted apart by kind, and every one written back.
- Relations are written back as ids: saving an activity links its steps and tags, it does not
  save them. An update leaves out what it does not mention, and a family's tags are written
  with that family alone.
- Resources shown for an activity are gathered from the steps that own them, deduplicated by id.
- Preparation time is the steps preparing the game, and play is every other step. A step with no
  duration counts as 0.
- A stored 0 reads as an unset range end, and an unset end is stored as 0.

*`tests/material.spec.ts`* — the link to a catalogue material

- A link reads with the catalogue material's name folded in, and no trace of `expand`; an
  unexpanded material reads as no name.
- The name is never written back: renaming is the catalogue's.

*`tests/tag.spec.ts`* — the pickers' options

- Tags are grouped by kind whatever order they arrive in. Every kind has a list, empty if need
  be, and a kind the enum does not know yet keeps its tags.
- Inside a kind, tags are sorted by name.

*`tests/step.spec.ts`* — the step and resource mappers

- A step reads its relations out of `expand` and leaves no trace of it; an unexpanded relation
  reads as empty. Relations are written back as ids.
- Actions never set read as none, and a blank action is not written.
- A resource's stored file name becomes `url`; a write sends the picked file, never the url.

*`activities-authoring/tests/useActivityEdit.spec.ts`* — the one order that matters, in the
feature that owns the composable

- Adding a step writes a blank one and links it before the modal opens; if the link fails there
  is nothing to open.
- A removed step is unlinked **before** it is deleted, never the other way round.
- A material's link the activity's list could not take is deleted again.
- A link that cannot be written puts the list back and deletes nothing, rather than leaving the
  screen claiming a step the record does not have.
- A delete that fails after the unlink landed leaves the step off the activity anyway.

## Not finished

Most of what follows is the editor's, and is listed here because it is about this feature's
data. [activities-authoring](activities-authoring.md) has the gaps that belong to its screens.

- **Tags read in French whatever the locale.** Their wordings were per locale for a while and
  are one language again until data gets a systematic way to be translated.
- **The list cannot be filtered**, only searched by name and description. The family columns
  are ready for increment 1's filters, but a filter key is a column name, not a family path.
- **The number of leaders needed is typed in.** The template computes it from age, group size
  and the supervision referential, which does not exist yet.
- **The template's generated steps do not exist yet.** Gathering the material, gathering the
  children and the safety checklist are for the run screen to produce, and there is no run
  screen. Nothing in the data stands for them, on purpose.
- **Resources still hang off the steps.** The template has one list for the activity, recalled
  by the steps, the way materials now work.
- **A step's visual is only a brief.** There is no file field for it yet, and the activity's
  own picture input goes nowhere (below).
- **The picture input goes nowhere.** The `activities` collection has a `visual` file field,
  but the form is not wired to it, so what the user picks is shown and then dropped. There is an
  `XXX` on it in the page.
- **Cancelling leaves what was already written.** A step is a record before the modal opens, so
  cancelling keeps an empty one on the activity; a file uploaded inside the modal is stored
  before the step points at it. `back/hooks` reclaims a resource no step references any more,
  but only on a step *update* — a cancel never gets that far, and neither does deleting a step,
  which leaves its resources behind the same way.
- **A step whose link could not be written stays in `activities_steps`.** It is deliberate:
  deleting it would be the safe move only if the failed update definitely did not land, and
  `cascadeDelete` makes guessing wrong expensive.
- Images throughout are placeholders from `placeholder.pagebee.io`.
