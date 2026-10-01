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
| `activities.play` | `/activities/:id/play` | Running the activity, one step at a time |

`/` redirects to `activities`.

One composable to a screen: `useActivitiesList` holds the results and the search,
`useActivity` the detail screen, and `useActivityPlay` the run.

## Running an activity

The detail screen's *Start* opens the run: the steps one at a time, a progress bar, the step
list to jump around in, and the actions to tick as they are done. A step shows its description,
its actions, the end criteria when it announces the end, its tip, and the materials and
resources it uses.

`playStepsOf` in `model/play.ts` turns the activity into the run's steps, as `PlayStep` — one
shape for a step the author wrote and one the app generates. The template has the app produce
two steps that are never stored:

- **Gathering the material** comes first, before anything is set up, with each material and its
  quantity as an action to tick. An activity needing no material has none.
- **Gathering the children** comes once the game is ready: before the first step that is not
  preparing it. An activity whose every step prepares it has none.

A run lives in memory: ticks and position are lost on leaving the screen or reloading it.

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
families on read and flattens them on write. An unset single choice is `null`; the mapper
reads and writes it as the empty string PocketBase stores.

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

An activity is several collections and relations are stored as ids, so a record can only be
written once what it points at exists. **Nothing is written before the save**, and the save is
**one batch**: every write, in order, inside one PocketBase transaction — all of them land or
none does ([ADR 0017](../adr/0017-an-activity-is-saved-in-one-batch.md)).

Until then the editor holds everything:

| Added | Held as | By |
|---|---|---|
| the activity | a blank one, on the `new` route | `useActivityEdit` |
| a step, a workshop | a blank one, joining the list when its modal is confirmed | `useActivityEdit.newStep`, `newWorkshop` |
| a file | a resource carrying the picked `File`, previewed from a `blob:` url | `useStepResources` |
| a material | a link to the catalogue material | `useActivityEdit.addMaterial` |
| a name the catalogue does not have | a catalogue material, and a link to it | `useActivityEdit.createMaterial` |
| a quantity, a tag, any field | typed into the record it belongs to | the form |

**A new record's id is chosen when it is added** (`saveApi.newId`, in PocketBase's format).
That is what lets one batch create a step and then the activity listing it, and lets a step
recall a material link created in the same save.

`activityWrites(original, edited)` turns the two versions into the batch. A record `original`
lacks is created, one `edited` lacks is deleted, one that changed is updated — compared as JSON,
since the edited record is a copy of the read one. A file is new when it carries its `file`,
which a read never does. The order is the one every write needs:

1. names added to the catalogue that a link still uses, then the activity itself if it is new,
   with empty lists;
2. material links; new steps, without their files; the files, pointing at their step; the new
   steps listing their files; the changed steps;
3. workshops;
4. the activity's own update: every family, its tags, and its lists;
5. the deletes — steps, workshops, then material links — once nothing lists them.

**Deleting a step comes after the update that unlinks it.** `activities.steps` has
`cascadeDelete` on, which in PocketBase deletes the record *holding* the relation once the
deleted id leaves it with no references left — so deleting an activity's last step while it is
still listed would take the activity with it. Inside one batch the order still holds, and the
one-step case is not a special case.

**Taking a material off** is `withoutMaterial`: off the activity's list and off every step and
workshop recalling it, so their updates drop it before the link is deleted. A file taken off a
step is only unlinked; `back/hooks` reclaims a resource no step lists once the step is updated.

A blank record is a valid one once filled in: `createEmptyActivity` fills in every family and
the `state` the collection requires — a new activity starts as `DRAFT` — and `useActivityEdit`
adds the id and the owner from the session. `createEmptyStep` seeds a step's `kind`, and
`createEmptyWorkshop` a workshop's placeholder name. They are the authoring feature's. A modal
refuses to close on what the collection would refuse — a step with no description
(`stepProblems`), a workshop with no name (`workshopProblems`) — so the save does not fail on it.

A rejected save comes back as `ValidationError`. The batch says which write failed, and
`saveErrors` puts an activity write's errors against its fields and any other record's under the
list holding it — steps, workshops or materials.

## Rules that hold

Five specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
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

*`tests/play.spec.ts`* — the steps of a run

- Gathering the material comes first, and only when the activity needs some; each material is an
  action to tick, with its quantity when it has one.
- Gathering the children comes before the first step not preparing the game — first when nothing
  is prepared, not at all when everything is. A preparation step written later stays where it is.
- Only the step announcing the end shows end criteria.

*`activities-authoring/tests/activity.edit.spec.ts`* — the save's order, in the feature that
owns the editor

- A new activity is created bare before anything points at it, and lists them in a last update.
- A new step is created without its files, and lists them once they are created; a file picked
  for an existing step is created before the step's update.
- Only what changed is updated; an unchanged activity writes itself and nothing else.
- A removed step is deleted only **after** the update that unlinks it, never before; a material
  link only after every step and workshop has let go of it.
- A name added to the catalogue is created before the link to it, and not at all once nothing
  links it.
- A refused write's errors go to the activity's fields, or under the list holding the record.

## Not finished

Most of what follows is the editor's, and is listed here because it is about this feature's
data. [activities-authoring](activities-authoring.md) has the gaps that belong to its screens.

- **Tags read in French whatever the locale.** Their wordings were per locale for a while and
  are one language again until data gets a systematic way to be translated.
- **The list cannot be filtered**, only searched by name and description. The family columns
  are ready for increment 1's filters, but a filter key is a column name, not a family path.
- **The number of leaders needed is typed in.** The template computes it from age, group size
  and the supervision referential, which does not exist yet.
- **The safety checklist is not generated.** The run produces gathering the material and the
  children, but not the template's safety checklist. Nothing in the data stands for any of the
  generated steps, on purpose.
- **A run is not kept.** Reloading the run screen starts it over, and nothing records that an
  activity was run.
- **Resources still hang off the steps.** The template has one list for the activity, recalled
  by the steps, the way materials now work.
- **A step's visual is only a brief.** There is no file field for it yet, and the activity's
  own picture input goes nowhere (below).
- **The picture input goes nowhere.** The `activities` collection has a `visual` file field,
  but the form is not wired to it, so what the user picks is shown and then dropped. There is an
  `XXX` on it in the page.
- Images throughout are placeholders from `placeholder.pagebee.io`.
