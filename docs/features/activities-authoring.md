# activities-authoring

Authoring activities: the author's own list, and the form behind it.

[activities](activities.md) is the other half — the public catalogue, which reads. This one
writes, and the two never overlap on a screen: browsing everybody's activities and managing
your own are different questions asked of the same collection — a feature boundary rather than
a mode.

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities.authoring` | `/activities/authoring` | The author's list, by state |
| `activities.authoring.new` | `/activities/authoring/new` | Authoring an activity not saved yet |
| `activities.authoring.page` | `/activities/authoring/:id` | Authoring, one form |

All three are admin-only: `meta.roles` is `[Role.ADMIN]`, so the auth guard sends anyone else home,
and the sidebar hides their links ([auth](auth.md#roles)).

## The list

`useActivitiesEditList` owns it: the results, the state tab and the delete.

**It is not scoped to the signed-in author yet.** `buildAuthoredFilters` queries by state only,
so every signed-in user sees — and may delete — every activity. A new one still records its
author: `currentId()` fills `user` when the editor opens on it, and throws rather than
returning nothing when there is no session.

The tabs are **all / drafts / published**, declared as `authoredStateTabs` — domain data, with
translation keys for labels. `null` is the "all" tab, and `removeEmptyFilters` drops the filter
for it, so the unfiltered tab and a chosen one take the same path. Switching tabs returns to
page 1.

Each row carries a state badge and a dropdown with **Edit** and **Delete**. Edit is a
`RouterLink`; delete emits, and the page confirms before the composable writes — the same
split as the step list inside the editor.

**Deleting an activity is one call, unlike deleting a step.** `activities_steps.activity`,
`activities_materials.activity` and `activities_workshops.activity` cascade, so the steps,
material links and workshops go with the activity, and the resources go with the steps. The
catalogue materials stay. The relation that makes step deletion delicate is the other one, `activities.steps`.

**Adding is a link**: it opens the editor on the `new` route, and nothing is written until the
first save there creates the activity.

## Importing a sheet

The **import** button beside add opens `ActivityImport.modal`, in three stages: a JSON sheet;
what it lacks; then its files — an optional cover visual and each step's resources, which a JSON
file cannot carry. The JSON is what the `fiche-to-json` skill (`.claude/skills/`) writes
from the Confluence activity sheet template, against the skill's `fiche-activite.schema.json`.
`model/activity.import.ts` is what defines the format; a spec reads the skill's `example.json`
through it and checks the schema's enum codes against the app's, so the three cannot drift.

`readActivitySheet` reads the file's text. It collects **every** problem with where it is
(`steps[2].kind`) rather than stopping at the first, and the modal lists them. Anything missing
or `null` reads as unset. `name` is required, and so is a title or a description on each step.
The sheet reads as `ActivityData` does, family by family, except that **tags, safety
instructions, tips and materials are names**: the file is written before anything exists to
point at. The format is version 2; version 1 named safety tags and gave each step a tip, a visual
brief and end criteria, and is refused.

- **Tags, safety instructions and tips are matched, never created.** A name links the one of the
  same kind whose name or slug it is, whatever the case — a tip has no slug, so by name. One that
  matches nothing is listed in the modal, each name once, with a pick of the existing ones of
  its kind: it links the one picked, or is left off.
- **What the draft still lacks is recapped** (`unsetFields`), for the author to fill in the
  editor. A field that only applies to some activities is listed only for those: practices and
  supervision notes for a workshop, universes when the imaginary is imposed. Steps with no
  duration are named.
- **Materials are the sheet's list plus whatever a step or workshop recalls** that the list
  forgot, each name once. Each is the catalogue material of that name, whatever the case, or a
  new one when the catalogue has none. The activity links each with its quantity, and steps and
  workshops recall the links by name.
- **A step with no description gets its title as one**: the collection refuses a blank
  description, and most steps of the template are a title over actions.

`draftFromSheet` builds the whole activity in memory — a draft, by the signed-in user — with
its material links, steps and workshops, each under the id it will be created with, and the
catalogue names it needs that do not exist yet. A step's id is chosen when the sheet is read, so
the files picked for it can point at it. `useActivityImport` then saves it the way the
editor saves ([activities](activities.md#saving)): one batch, the visual included, **all or
nothing** by transaction. A refused import writes nothing, catalogue names included. On success
the editor opens on the new draft.

## The form

`useActivityEdit` holds it. It also covers the material list, the workshops and the steps, all
of them held in memory until the save sends them through `save.api.ts`. How saving works, and
in which order, is described in [activities](activities.md#saving).

On the `new` route it starts from a blank activity, with its id and its author; on `:id` it reads
the activity and keeps a copy, which is what the save compares against.

The form is **one panel per family**, in the template's order: information (name, picture,
visual brief), description, classification, imaginary, audience, supervision, place and
conditions, pedagogy, then preparation, workshops and steps. Characteristics and preparation
are tabbed panels — the families in one, safety, materials and tips in the other — and their
menu entries open the tab before scrolling to the panel. The optional selects
offer an empty choice, which is how PocketBase stores none. Multi-valued choices (practices,
seasons, locations) are a `MultiSelect` over translated options, which `useActivityEdit` maps
back to the stored values.

**Age and participants are two-thumb sliders**, `RangeInput` from @chapelure/ui, over
`AGE_BOUNDS` (0–18) and `PARTICIPANTS_BOUNDS` (1–30). The slider's unset end is `null`. The
field's unset end is 0, which is what PocketBase stores for an empty number. `rangeEndOf` and
`columnOf`, in `activities/model/activity.ts` since the detail screen reads bounds too, translate
between the two. Without them a new activity's `ageMax: 0` would pin the upper thumb to the
floor. `useActivityEdit` binds each end through a writable `computed`. `rangeLabel`, from the
same package, says what the range reads as beside its label ("3 to 10", "up to 10", "any").

**Tags are one picker per kind, placed in their family's panel.** `useReferenceOptions` reads
every tag, safety instruction and tip once, through the read-only `tags.api.ts`, `safety.api.ts`
and `tips.api.ts`, and `tagOptions` groups the tags by kind. Each is a `TagSelect` bound straight
to the family's list, for example `activity.pedagogy.goals`, in a `Field` showing the error the
backend keys by that relation (the development axes share one, shown under all six). The
safety tab picks `activity.safety.instructions` the same way, and the tips tab
`activity.tips`. The activity's links are its own copies, not the options, so every picker
passes `keyBy="id"`. Nothing is written until save, which sends the ids with the rest of the
form.

**Materials are picked from the catalogue.** `MaterialsSelection` suggests the catalogue
materials the activity does not list yet (`useMaterialCatalogue`), and offers to add a name the
catalogue does not have. It emits, and `useActivityEdit` links the material, or creates the new
name and links it, or takes the link off; the author types a quantity straight into the link.
The save writes all of it — a new name only if a link still uses it. Renaming and deleting a catalogue
material is [catalogue-authoring](catalogue-authoring.md)'s. The step and workshop modals take
the activity's links as a prop and pick among them with the same `TagSelect`. They never create
one.

**The step modal** edits a copy of a step — title, duration, kind, description, actions to
tick, materials and resources — and hands it back on confirm (`useDraftModal`); **Add** opens it
on a blank step, which joins the list only then. It writes nothing, and refuses to close on a
step with no description. A picked file stays in the browser until the save uploads it. The
steps panel heading shows the preparation and playing time `timingOf` sums from the steps.

**Workshops** work the way steps do. **Add** opens `WorkshopEdit.modal` on a blank one, named
from the locales, which joins the list once confirmed. Removing asks for confirmation, then
takes it off the list; the save deletes it.

**The state button sits beside save.** `stateTransition` decides it: there are two states, so
the button is not a choice between them but the other end of a toggle, and it returns the
target state and the label together so a button reading "Publish" cannot write `DRAFT`.
Anything not already published offers the forward move, rather than matching `DRAFT` exactly,
so a state added later is still publishable.

It **writes the state and nothing else**, which is why it sits next to save rather than inside
it: unsaved form edits stay on screen, unsaved, and the save button is still there for them. A
failure is an alert rather than a field error — no field on the form stands for the state.
It is disabled on a new activity, which has no record to write the state to until it is saved.

## Data

The types are not this feature's. `ActivityData`, `ActivityStepData` and their mappers stay in
`activities/`, and this feature imports them: it writes activities, it does not redefine them.
What is its own is the writing side, in `model/activity.edit.ts`, `model/step.edit.ts`,
`model/material.edit.ts` and `model/workshop.edit.ts`. That covers the blank records offered on
add and what the collection would refuse in them, the tabs and the state toggle, picking among
records, the material suggestions, what removing a material leaves behind, the file limit, and
the writes a save comes down to (`activityWrites`, `saveErrors`). The dependency runs one way — `activities` imports nothing from here.

Translations follow the same rule. `activities.authoring.*`, `activities.state.*` and
`activities.untitled` live here; `activities.fields.*` and `activities.steps.fields.*` stay
with `activities`, because the read side uses parts of both and carving up a shared subtree
would scatter one screen's labels across two files.

## Rules that hold

The specs, in `tests/`.

*`tests/activity.edit.spec.ts`* — the state toggle, the authored query, and the save

- A draft offers "publish", a published activity offers "back to draft", and the label always
  matches the state that will be written.
- Any state that is not published offers the forward move.
- The "all" tab drops the state filter rather than taking a branch of its own.
- A picker holds the options themselves, matched by id to the activity's own copies.
- A confirmed record replaces the one sharing its id, or is added at the end.
- The save's order, and what it leaves out: see [activities](activities.md#rules-that-hold).

*`tests/material.edit.spec.ts`* — picking a material, and removing one

- The catalogue materials offered are the ones this activity does not link yet, by catalogue id,
  sorted by name and narrowed by what was typed, whatever its case.
- Adding a name is offered only when the catalogue does not have it, whatever its case, and the
  activity does not list it.
- A name finds its catalogue material whatever its case and the spaces around it.
- A removed material leaves the activity's list and every step and workshop that recalled it.

*`tests/step.edit.spec.ts`* — the file limit, and what a step must hold

- A step takes at most `MAX_STEP_RESOURCES` (10) files. Over the limit, the files that fit are
  still taken and the rest reported — a partial pick beats dropping all of it.
- A description with no text in it — an emptied editor's `<p></p>` included — is refused.

*`tests/activity.import.spec.ts`* — reading a sheet and turning it into records

- Every problem is reported at once, each with its path; a version other than 2 is refused.
- Missing and `null` read as unset; a step that does not say its kind is a free one.
- A tag links by name or slug, whatever the case, within its own kind, and one that matches
  nothing is reported rather than created. So does a safety instruction, and a tip by name.
- The materials are the list plus what steps and workshops recall, each name once.
- The skill's `example.json` reads without a problem.
- A name that matched nothing links what the author picked among its own kind, and is still
  reported, once.
- The recap lists a workshop's practices and notes, and imposed universes, only then; one bound,
  one place flag or one axis counts as set; steps with no duration are named.
- A step gets the files picked for it, under the id they point at.
- The skill's schema lists exactly the app's enum codes, its development axes and version 2.
- A material the catalogue has, whatever its case, is linked rather than added again; a name it
  lacks is added once, and linked to what is added.
- Every record hangs off the activity, and steps and workshops recall the links.

*`tests/ActivitiesEdit.page.spec.ts`* — the list's wiring: a delete waits for the confirmation,
and a tab re-queries.

The other components get none, per [ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md),
and neither do the composables: the order of a save is decided by `activityWrites`, and each
composable ends in one call to `saveApi.send`.

## Not finished

- **Leaving the editor drops what was not saved, without asking.** Steps, files and materials
  wait for the save button now, and nothing warns before navigating away from them.
- **A refused step, workshop or material points at its list, not at itself.** The batch says
  which write failed, but once a modal is closed the form has no field to show it against; only
  what the modals check (a step's description, a workshop's name) is caught before the save.
- **A picked file's preview url is never revoked.** The `blob:` and the file it holds stay in
  memory until the page is reloaded, the editor left or not.
- **Deleting the last row of a page leaves that page empty.** The list re-queries on the page
  it was on, and a page past the end comes back with nothing rather than stepping back one.
- **The state button does not save the form.** Deliberate — see above — but a user who edits
  and then publishes has to press save as well, and nothing on screen says so.
- **Admin-only on the client alone.** The collections' API rules do not check the role, so
  any signed-in user can still write through the API.
- **No per-kind limit on tags.** Each relation could now carry its own `maxSelect` and
  `required` (ADR 0014), but none is set.
- **The form shows safety instructions and tips by name only.** Their text is on the detail
  screen.
- **A tip cannot be added from the editor.** The catalogue is the Dashboard's, as the tags are.
  The migration filled it with one tip per step that had one, named after the step, so it holds
  near-duplicates to merge by hand.
- **A range has no "exactly 0" and no open top above the ceiling.** 0 is unset, and an end at
  the slider's edge is unset too, so "18 and up" is as high as age can say.
- **Nothing checks that a range's minimum is below its maximum**, for age or participants.
- **Practices are offered whatever the format**, though the template reserves them for a
  workshop. Nothing clears them when the format changes.
- **Removing a material asks for no confirmation**, unlike a step or a workshop. It is one row
  and cheap to add back, but the steps that recalled it lose the link for good.
- The rows reuse the placeholder images the rest of the app does.
- **An import cannot fetch a fiche's resources.** A fiche links its files, and a step resource is
  an upload: the skill lists them, and the author uploads them in the modal's last stage.
- **An imported visual shows nowhere yet.** It is stored, but the mapper hands `visual` back as
  the file's name, and the list and the editor do not read it.
- **Picking the same JSON file again after fixing it does nothing** in some browsers: the file
  input keeps its value, so no `change` fires. `FilesInput` would have to clear it after a pick.
