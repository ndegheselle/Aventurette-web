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

**Deleting an activity is one call, unlike deleting a step.** `activities_steps.activity`
cascades, so the steps go with the activity and their materials and resources go with the
steps. The relation that makes step deletion delicate is the other one, `activities.steps`.

Adding writes the activity and opens the editor on it.

## The form

`useActivityEdit` holds it, with the step modal, the materials and resources inside it, and
`steps.api.ts`. How saving works, and why every record is written the moment it is added, is
described in [activities](activities.md#saving).

The form is thin: a picture input, a name, a description and the steps panel.

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
What is its own is the writing side, in `model/activity.edit.ts` and `model/step.edit.ts`: the
blank records written on add, the tabs and the state toggle, the material suggestions and the
file limit. The dependency runs one way — `activities` imports nothing from here.

Translations follow the same rule. `activities.authoring.*`, `activities.state.*` and
`activities.untitled` live here; `activities.fields.*` and `activities.steps.fields.*` stay
with `activities`, because the read side uses parts of both and carving up a shared subtree
would scatter one screen's labels across two files.

## Rules that hold

Four specs, in `tests/`.

*`tests/activity.edit.spec.ts`* — the state toggle and the authored query

- A draft offers "publish", a published activity offers "back to draft", and the label always
  matches the state that will be written.
- Any state that is not published offers the forward move.
- The "all" tab drops the state filter rather than taking a branch of its own.

*`tests/step.edit.spec.ts`* — suggesting a material, and the file limit

- The names offered are the distinct ones used anywhere, minus what this step already has,
  narrowed by what was typed — all matched case-insensitively, first spelling wins.
- Creating is offered only for a name that is neither already on the step nor a suggestion.
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
- **The form edits three fields.** The columns an activity carries — age, participants, season,
  environment, weather, energy level, tags — have no inputs behind them yet.
- The rows reuse the placeholder images the rest of the app does.
