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
| `activities.authoring.page` | `/activities/authoring/:id` | Authoring, one form |

Both are behind the auth guard, like everything but login and register.

## The list

`useActivitiesEditList` owns it: the results, the state tab, the add button and the delete.

**It is not scoped to the signed-in author yet.** `buildAuthoredFilters` queries by state only,
so every signed-in user sees — and may delete — every activity. A new one still records its
author: `currentId()` fills `user` on create, and throws rather than returning nothing when
there is no session.

The tabs are **all / drafts / published**, declared as `authoredStateTabs` — domain data, with
translation keys for labels. `null` is the "all" tab, and `removeEmptyFilters` drops the filter
for it, so the unfiltered tab and a chosen one take the same path. Switching tabs returns to
page 1.

Each row carries a state badge and a dropdown with **Edit** and **Delete**. Edit is a
`RouterLink`; delete emits, and the page confirms before the composable writes — the same
split as the step list inside the editor.

**Deleting an activity is one call, unlike deleting a step.** `activities_steps.activity`,
`activities_materials.activity` and `activities_workshops.activity` cascade, so the steps,
materials and workshops go with the activity, and the resources go with the steps. The relation that makes step deletion delicate is the other one, `activities.steps`.

Adding writes the activity and opens the editor on it.

## The form

`useActivityEdit` holds it. It also covers the material list, the workshops and the steps,
through `materials.api.ts`, `workshops.api.ts` and `steps.api.ts`. How saving works, and why
every record is written the moment it is added, is described in
[activities](activities.md#saving).

The form is **one panel per family**, in the template's order: information (name, picture,
visual brief), description, classification, imaginary, audience, supervision, place and
conditions, safety, pedagogy, then materials, workshops and steps. The optional selects offer an
empty choice, which is how PocketBase stores none. Multi-valued choices (practices, seasons,
locations, a step's end criteria) are checkboxes bound to the list.

**Age and participants are two-thumb sliders**, `RangeInput` from @chapelure/ui, over
`AGE_BOUNDS` (0–18) and `PARTICIPANTS_BOUNDS` (1–30). The slider's unset end is `null`. The
field's unset end is 0, which is what PocketBase stores for an empty number. `rangeEndOf` and
`columnOf`, in `activities/model/activity.ts` since the detail screen reads bounds too, translate
between the two. Without them a new activity's `ageMax: 0` would pin the upper thumb to the
floor. `useActivityEdit` binds each end through a writable `computed`. `rangeLabel`, from the
same package, says what the range reads as beside its label ("3 to 10", "up to 10", "any").

**Tags are one picker per kind, placed in their family's panel.** `useTagOptions` reads every
tag once, through the read-only `tags.api.ts`, and `tagOptions` groups them by kind.
`RecordsPicker` wraps a `TagSelect` bound straight to the family's list, for example
`activity.safety.tags`, and shows the error the backend keys by that relation (the development
axes share one, shown under all six). `TagSelect` tells a picked item by reference, so what a
picker holds is `pickedAmong` the options, matched by id against the activity's own copies.
Nothing is written until save, which sends the ids with the rest of the form.

**Materials are the activity's list.** `MaterialsSelection` suggests names from every
activity's materials (`useMaterialSuggestions`) and lets the author type a quantity per row.
It emits, and `useActivityEdit` writes. The step and workshop modals take the activity's
materials as a prop and pick among them with the same `RecordsPicker`. They never create one.

**The step modal** edits a step's title, duration, kind, description, actions to tick, visual
brief, tip, materials and resources. The end criteria show only on the step announcing the end
(`hasEndCriteria`). The steps panel heading shows the preparation and playing time `timingOf`
sums from the steps.

**Workshops** work the way steps do. **Add** writes a blank one, named from the locales, links
it, and opens `WorkshopEdit.modal` on it. Removing asks for confirmation, then deletes it in one
call: `activities.workshops` does not cascade, so nothing needs unlinking first.

**The state button sits beside save.** `stateTransition` decides it: there are two states, so
the button is not a choice between them but the other end of a toggle, and it returns the
target state and the label together so a button reading "Publish" cannot write `DRAFT`.
Anything not already published offers the forward move, rather than matching `DRAFT` exactly,
so a state added later is still publishable.

It **writes the state and nothing else**, which is why it sits next to save rather than inside
it: unsaved form edits stay on screen, unsaved, and the save button is still there for them. A
failure is an alert rather than a field error — no field on the form stands for the state.

## Data

The types are not this feature's. `ActivityData`, `ActivityStepData` and their mappers stay in
`activities/`, and this feature imports them: it writes activities, it does not redefine them.
What is its own is the writing side, in `model/activity.edit.ts`, `model/step.edit.ts`,
`model/material.edit.ts` and `model/workshop.edit.ts`. That covers the blank records written on
add, the tabs and the state toggle, picking among records, the material suggestions, what
deleting a material leaves behind, and the file limit. The dependency runs one way — `activities` imports nothing from here.

Translations follow the same rule. `activities.authoring.*`, `activities.state.*` and
`activities.untitled` live here; `activities.fields.*` and `activities.steps.fields.*` stay
with `activities`, because the read side uses parts of both and carving up a shared subtree
would scatter one screen's labels across two files.

## Rules that hold

Five specs, in `tests/`.

*`tests/activity.edit.spec.ts`* — the state toggle, the authored query and picking records

- A draft offers "publish", a published activity offers "back to draft", and the label always
  matches the state that will be written.
- Any state that is not published offers the forward move.
- The "all" tab drops the state filter rather than taking a branch of its own.
- A picker holds the options themselves, matched by id to the activity's own copies.

*`tests/material.edit.spec.ts`* — suggesting a material, and deleting one

- The names offered are the distinct ones used anywhere, minus what this activity already has,
  narrowed by what was typed — all matched case-insensitively, first spelling wins.
- Creating is offered only for a name that is neither already on the activity nor a suggestion.
- A deleted material leaves the activity's list and every step and workshop that recalled it.

*`tests/step.edit.spec.ts`* — the file limit

- A step takes at most `MAX_STEP_RESOURCES` (10) files. Over the limit, the files that fit are
  still taken and the rest reported — a partial pick beats dropping all of it.

*`tests/useActivityEdit.spec.ts`* — the one order that matters; see
[activities](activities.md#rules-that-hold).

*`tests/ActivitiesEdit.page.spec.ts`* — the list's wiring: a delete waits for the confirmation,
and a tab re-queries.

The other components get none, per [ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md),
and neither does `useActivitiesEditList`: its writes are one call each with no ordering rule
between them.

## Not finished

- **Deleting the last row of a page leaves that page empty.** The list re-queries on the page
  it was on, and a page past the end comes back with nothing rather than stepping back one.
- **The state button does not save the form.** Deliberate — see above — but a user who edits
  and then publishes has to press save as well, and nothing on screen says so.
- **The authoring link in the navbar shows when signed out**, and clicking it bounces to login.
  The public activity list already behaves that way, so this is consistent rather than special.
- **No per-kind limit on tags.** Each relation could now carry its own `maxSelect` and
  `required` (ADR 0014), but none is set. A safety tag's description is not shown anywhere on
  the form.
- **A range has no "exactly 0" and no open top above the ceiling.** 0 is unset, and an end at
  the slider's edge is unset too, so "18 and up" is as high as age can say.
- **Nothing checks that a range's minimum is below its maximum**, for age or participants.
- **Practices are offered whatever the format**, though the template reserves them for a
  workshop. Nothing clears them when the format changes.
- **Removing a material asks for no confirmation**, unlike a step or a workshop. It is one row
  and cheap to add back, but the steps that recalled it lose the link for good.
- The rows reuse the placeholder images the rest of the app does.
