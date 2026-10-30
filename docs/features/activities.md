# activities

Browsing the public activity catalogue.

Read-only. Writing an activity is [activities-authoring](activities-authoring.md), which owns the
editor, the step and workshop modals, the author's own list and the rules for writing. What
stays here is the **shape**: `models/activity.ts` (safety instructions included),
`models/step.ts` (tips included), `models/material.ts`, `models/workshop.ts` and `models/tag.ts`, their mappers in
`api/`, and `api/activities.api.ts`
describe what an activity is — which both halves need — and the
dependency runs one way: nothing here imports `activities-authoring`.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities.library` | `/activities/library` | The library's catalogue tab |
| `activities.favorites` | `/activities/library/favorites` | The library's favorites tab |
| `activities.page` | `/activities/:id` | One activity in full |
| `activities.play` | `/activities/:id/play/:step?` | Running the activity, one step to a page |
| `activities.feedback` | `/activities/:id/feedback` | After a run: well done, and what the user thought |

`/` redirects to `activities.library`. The library's tabs are child routes of
`/activities/library`, so the sidebar's and the dock's link to the library stays active on
any tab.

The catalogue has no search tab: its top holds the search, and under it a line of badges for
the quick filters (age, duration, place), each reading as its name until something is chosen and
as the choice after. A badge opens a sheet with that filter's values alone; the button at the
start of the line opens one with every filter, a *Reset* and the *Apply my profile* toggle. Both
are `ResponsiveModal`s and edit a draft that only *Apply* keeps (`useCatalogueFilters`). The
quick filters start from the profile's defaults ([user](user.md)), and the toggle reads on while
they still match them (`models/catalogueFilters.ts`). The fields are `ui/library/filters.vue`.

The detail screen's actions end with the planning's button (`planning/ui/PlanButton.vue`),
beside the heart. The catalogue shows the planning's banner (`planning/ui/PickBanner.vue`)
while the planning is picking an activity from it.

One composable to a screen: `useActivitiesList` holds the results and the search,
`useActivity` the detail screen, `useActivityPlay` the run and `useActivityFeedback` the screen
after it.

## Favorites

A heart on every card and on the detail screen adds the activity to the user's favorites, or
takes it off (`_parts/favorite.vue`). Either way a toast says so; the one for a removal has a
*Cancel* button that puts the favorite back, with no toast of its own. The favorites tab shows
them with the library's card, in the order they were added, or a message saying there are none
yet.

`useFavorites` is all of it: the list, and adding or removing one. The list is module state,
shared by every heart and the tab. It is read once per signed-in user, by id, and kept in step
with each change after that: `favoritesApi.of` reads the user record with `favorites` expanded,
each one through `activityMapper`'s relations (`favoritesMapper`), and keeps nothing else of the
record. The session does not carry the favorites ([user](user.md#the-session)).

**A change sends one activity, never the list** — `favoritesApi.add` and `remove` go through the
crud port's `link` and `unlink`, PocketBase's `favorites+` and `favorites-`. Two hearts tapped at
once therefore both land, and no change has to wait for another. The adapter sends them without
a request key: the SDK would otherwise abort the first when the second goes to the same record.

## Running an activity

The detail screen's *Start* opens the run: one page to a step, and a progress bar. The step is the route's 1-based `step` param — none is the first, and
one past either end is the nearest (`playStepIndexOf`). Moving between steps replaces the
history entry, so the whole run is one entry and leaving it pops that entry rather than pushing
the detail screen on top. A step shows its description, the
materials and resources it uses, and a button opening its tips.

Materials and resources show the same way on the detail screen and in the run: square tiles on
one scrolling line (`_parts/supplies.vue`), a picture on top and the name beside the quantity.
Only an image resource has a picture (`pictureOf`); the rest show an icon in its place.

The run plays the steps the author wrote, in their order, and nothing else: the app adds no
step of its own.

A run's position is in the URL.

## After a run

The last step's *Finish* replaces the run with the feedback screen: a *well done*, Noto's
animated confetti ball, and what the user thought of the activity. *Leave* goes back to the
activity page the way the run's own back button does (`returnToActivity`), so the run and
the feedback screen are one history entry between them.

- **A like** is `user_activity_feedback.liked`, written the moment it is toggled.
- **A favourite** is the same heart as on the cards and the detail screen (`_parts/favorite.vue`),
  written the moment it is toggled — see [Favorites](#favorites).
- **A comment** is `user_activity_feedback.comment`, written as the user leaves, and only if
  it changed (`commentToSave`). Emptying the field takes the comment back. A refused write
  keeps the user on the screen with what they typed.

`user_activity_feedback` holds one record per user and activity, under a unique index: the
first write creates it and every later one, on this run or another, updates it. The buttons
are held until the feedback is read and while a write is in flight, so a quick second tap
cannot create a second record. The heart is not held: a favourite is its own write. A user reads and writes their own feedback; an admin reads
everyone's. Deleting the user or the activity deletes it.

The animation is `ui/activity/_parts/confetti.lottie.json`, Noto's `1f38a` as Google publishes
it (CC BY 4.0), played by `lottie-web`'s light build. Both are loaded only when the screen
mounts, so they stay out of the main bundle.

## Data

Two types to an entity: `ActivityData` in `models/activity.ts` is what the app uses,
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
`catalog_materials` holds one row per name, and `activities_materials` holds what an activity needs of
one: a link with a free-text `quantity` ("one per team" is a quantity too). `activity.materials`
is those links, as `ActivityMaterialData`, with the catalogue material's `name` folded in by
`activityMaterialMapper`. A step or a workshop *recalls* the links it uses and owns none. None
of those lists cascades, so deleting a link only drops it from the lists holding it. Both the
link's relations do cascade: deleting an activity, or a catalogue material, deletes its links.

**A step** has a `kind`: preparing the game, a free step or the conclusion. It also has a
`title` and an estimated `duration` in minutes.
`timingOf` sums the durations: preparation is the steps preparing the game, play is every other
step. The collection still holds a step's `visual_brief`, and the `end_criteria` and
`end_criteria_other` of a kind that is gone. `stepMapper` drops them on read, so nothing above
`api/` sees them and no save writes them back (`StepColumnSetAside`).

**A workshop** is one of the stations an activity runs in parallel. It has a name, a theme, its
challenges, the materials it recalls and the adults it takes to hold it.

Tags all live in `catalog_tags`, and an activity links them through one relation per place
([ADR 0014](../adr/0014-activity-tags-are-one-collection.md)): `theme_tags` into
`classification.themes`, `imaginary_tags` into `imaginary.universes`, and `goal_tags`,
`ideal_for_tags` and `development_tags` into `pedagogy`. The six development axes share their
relation, and the mapper sorts them apart by kind. A backend hook refuses a tag linked in a
relation not meant for its kind. `name` is in one language, French, whatever locale the app is
showing. `tagOptions` in `models/tag.ts` groups every tag by kind for the editor's pickers.

**Safety instructions and tips are catalogues of their own**
([ADR 0018](../adr/0018-safety-instructions-and-tips-are-catalogues.md)). `catalog_safety_instructions`
holds a slug, a name and the precautions as rich text; an activity links them through
`safety_instructions`, read into `safety.instructions`. `catalog_tips` holds a name and the advice; an
step links them through `tips`, read into `step.tips`. Both are reference data, like
the tags: an activity or a step links them, and an admin writes them from
[catalogue-authoring](catalogue-authoring.md). The detail and run screens show the safety
instructions as a warning icon button beside the back button, with its count and only when there
is one (`ActivityNotices`); it opens a modal with every entry, its name and its text in full.
The run screen shows a step's tips in that step's panel.

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
step is only unlinked; `backend/api/hooks` reclaims a resource no step lists once the step is updated.

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

Eight specs, in `tests/`. What is *not* covered here is not an oversight: a formatter, a factory
or an api wrapper does not earn one — see
[ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md).

*`tests/activity.spec.ts`* — the mapper, the durations and the range bounds

- `activityMapper` asks for the nested relations steps, material links and workshops need,
  every tag relation and the safety instructions, and its steps ask for their tips. It
  inlines them down to the file urls, and reads a relation the request did not expand as empty
  rather than as ids.
- Columns are grouped by family on read and flattened back on write. Each tag relation is read
  into its family; the development axes are sorted apart by kind, and every one written back.
  The safety instructions go into the safety family.
- Relations are written back as ids: saving an activity links its steps, tags and safety
  instructions, it does not save them. An update leaves out what it does not mention,
  and a family's links are written with that family alone.
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
- The columns the app sets aside — the visual brief and the end criteria — are dropped on read,
  so a save never writes them back.
- A resource's stored file name becomes `url`; a write sends the picked file, never the url.
- A resource's picture is its url when that is an image, query string or not, and empty otherwise.

*`tests/favorites.spec.ts`* — the favorites mapper and list

- The favorites are asked for whole: every relation an activity needs, under `favorites`.
- They read as activities in their stored order, with nothing else of the user record; unexpanded,
  as none rather than as ids.
- An activity added twice is in the list once.

*`tests/useFavorites.spec.ts`* — taking a removal back

- Cancelling a removal from its toast writes the favorite back, not only shows it again.

*`tests/play.spec.ts`* — where a run is

- The route's 1-based step reads as an index; a missing or unreadable one is the first step, and
  one past either end is the nearest end.

*`tests/feedback.spec.ts`* — the screen after a run

- A comment is written trimmed, not at all when it is what is saved already, and as empty when
  the field is emptied.
- A like and a comment end in one feedback record: the second write updates what the first
  created, and a feedback from an earlier run is updated too.
- A refused comment keeps the user on the screen.

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
- **The list cannot be filtered, nor searched.** The catalogue's search and filters can be set
  and applied, but none is wired to the feed yet: the list stays the same. The family columns
  are ready for increment 1's filters, but a filter key is a column name, not a family path.
- **The number of leaders needed is typed in.** The template computes it from age, group size
  and the supervision referential, which does not exist yet.
- **The run adds no step.** The template's gathering of the material and of the children, and
  its safety checklist, are left to the author to write as steps.
- **A run is not kept.** Reloading the run screen starts it over, and nothing records that an
  activity was run. The feedback screen records what the user thought, not that they ran it.
- **Nobody reads the feedback yet.** An admin may, through the API; no screen shows the likes or
  the comments.
- **Resources still hang off the steps.** The template has one list for the activity, recalled
  by the steps, the way materials now work.
- **A step has no visual.** Its brief is still in the collection, set aside by the mapper, and
  comes back once visuals are handled properly. The activity's own picture input goes nowhere
  either (below).
- **The detail screen does not show tips.** Only the run screen does, at the step they belong to.
- **End criteria are no longer read.** The kind that showed them is gone; the columns keep what
  they held.
- **The picture input goes nowhere.** The `activities` collection has a `visual` file field,
  but the form is not wired to it, so what the user picks is shown and then dropped. There is an
  `XXX` on it in the page.
- Images throughout are placeholders from `placeholder.pagebee.io`.
