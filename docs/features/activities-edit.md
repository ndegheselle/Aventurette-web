# activities-edit

Authoring activities: the author's own list, and the form behind it.

[activities](activities.md) is the other half — the public catalogue, which reads. This one
writes, and the two never overlap on a screen: browsing everybody's activities and managing
your own are different questions asked of the same collection. Why that is a feature boundary
and not a mode is in [ADR 0014](../adr/0014-authoring-is-its-own-feature.md).

## Routes

| Name | Path | Screen |
|---|---|---|
| `activities.edit` | `/my-activities` | The author's list, by state |
| `activities.edit.page` | `/my-activities/:id` | Authoring, one form |

Both are behind the auth guard, like everything but login and register. The editor used to be
`/activities/:id/edit`; it was never a view of that activity, so it moved under the list it
belongs to.

## The list

`useActivitiesEditList` owns it: the results, the state tab, the add button and the delete.

**It is scoped to the signed-in author.** `buildAuthoredFilters` puts `user` in the query, and
that is not a filter the screen offers — it is what makes the list theirs, and what keeps its
delete button off somebody else's activity. `currentId()` throws rather than returning nothing
when there is no session, so a signed-out query cannot silently widen to everybody.

The tabs are **all / drafts / published**, declared as `authoredStateTabs` — domain data, the
same way `availablesEnvironments` is, with translation keys for labels. `null` is the "all"
tab, and `removeEmptyFilters` drops the filter for it, so the unfiltered tab and a chosen one
take the same path. Switching tabs returns to page 1.

Each row carries a state badge and a dropdown with **Edit** and **Delete**. Edit is a
`RouterLink`; delete emits, and the page confirms before the composable writes — the same
split as the step list inside the editor.

**Deleting an activity is one call, unlike deleting a step.** `activities_steps.activity`
cascades, so the steps go with the activity and their materials and resources go with the
steps. The relation that makes step deletion delicate is the other one, `activities.steps`,
which no longer cascades.

Adding writes the activity and opens the editor on it. That button used to live on the public
list; it belongs here, because that screen is for reading.

## The form

`useActivityEdit` and everything under it moved here unchanged — the step modal, the materials
and resources inside it, and `steps.api.ts`. How saving works, and why every record is written
the moment it is added, is described in [activities](activities.md#saving); the ordering rule
that spec pins has not changed.

What is new is **the state button, beside save**. `stateTransition` decides it: there are two
states, so the button is not a choice between them but the other end of a toggle, and it
returns the target state and the label together so a button reading "Publish" cannot write
`DRAFT`. Anything not already validated offers the forward move, rather than matching `DRAFT`
exactly, so a state added later is still publishable.

It **writes the state and nothing else**, which is why it sits next to save rather than inside
it: unsaved form edits stay on screen, unsaved, and the save button is still there for them. A
failure is an alert rather than a field error — no field on the form stands for the state.

## Data

Nothing of its own. `ActivityData`, `ActivityStepData` and their factories stay in
`activities/model/`, and this feature imports them: it writes activities, it does not redefine
them. The dependency runs one way — `activities` imports nothing from here.

Translations follow the same rule. `activities.edit.*`, `activities.state.*` and
`activities.untitled` live here; `activities.fields.*` and `activities.steps.fields.*` stay
with `activities`, because the read side uses parts of both and carving up a shared subtree
would scatter one screen's labels across two files.

## Rules that hold

Two specs, in `tests/`.

*`tests/activity.edit.spec.ts`* — the state toggle and the authored query

- A draft offers "publish", a published activity offers "back to draft", and the label always
  matches the state that will be written.
- Any state that is not validated offers the forward move.
- The query is always scoped to the author.
- The "all" tab drops the state filter rather than taking a branch of its own.

*`tests/useActivityEdit.spec.ts`* — the one order that matters, moved here with the composable.
Unchanged; see [activities](activities.md#rules-that-hold).

The components get none, per [ADR 0013](../adr/0013-specs-live-in-a-feature-tests-folder.md),
and neither does `useActivitiesEditList`: its writes are one call each with no ordering rule
between them.

## Not finished

- **Deleting the last row of a page leaves that page empty.** The list re-queries on the page
  it was on, and a page past the end comes back with nothing rather than stepping back one.
- **The state button does not save the form.** Deliberate — see above — but a user who edits
  and then publishes has to press save as well, and nothing on screen says so.
- **The authoring link in the navbar shows when signed out**, and clicking it bounces to login.
  The public activity list already behaves that way, so this is consistent rather than special.
- The rows reuse the placeholder images the rest of the app does.
