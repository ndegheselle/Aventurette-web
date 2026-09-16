# 0014 — Authoring activities is its own feature

**Status:** Accepted

## Context

Activities are what this app is for, so `features/activities/` grew into three times the next
biggest feature and was still the first place any new work would land. Size on its own is not
the problem — a core domain is supposed to be big, and a feature is measured by whether a
change stays inside it, not by its line count.

What was worth acting on is that the folder had stopped answering one question. Browsing
everybody's activities and managing your own are asked of the same collection, but they share
almost nothing else: different queries, different screens, opposite directions of data flow.
The public list even carried an **Add** button, which is authoring on a screen for reading.

The alternative to splitting was one feature with a mode — the same list, filtered to the
signed-in user, with the write buttons shown conditionally. That keeps one folder and spends
the saving on `v-if`.

## Decision

`features/activities-edit/` holds the writing: the author's own list, the edit form, the step
modal and everything under it, and `steps.api.ts`.

`features/activities/` keeps the reading, and keeps the **shape**: `model/activity.ts`,
`model/step.ts` and `api/activities.api.ts` stay there, because they describe what an activity
*is*, which both halves need.

The split is by **verb, not by entity**. Steps were the other candidate — they have their own
collection, their own api and their own model — and they stayed put, because the rule that
matters most in this schema (unlink a step before deleting it, or `cascadeDelete` takes the
activity) spans the activity and the step together. A feature boundary through the middle of
the one invariant with teeth is how it eventually gets lost.

The dependency runs one way: `activities-edit` imports `activities`, never the reverse. That is
what the **Add** button moving off the public list buys — it was the one thing pointing the
other way.

## Consequences

- The public list is read-only, and stays that way by construction rather than by review.
- Activities stops being where everything lands. The next screen about *doing* an activity —
  planning it, running it, favouriting it — is a third feature consuming `model/activity.ts`,
  not another folder inside this one.
- Two features now share a locale namespace (`activities.*`). The i18n merge is recursive, so
  they do not clobber each other, but a key is no longer findable from its path alone.
- Cross-feature imports go up: the editor reaches for `activities`' model, api, `StepSummary`
  and route names. ADR 0003 already allows this for everything but `pages/`, and it is the
  price of not duplicating the activity's shape.
- A feature name now has a hyphen in it, where the others are one word.
