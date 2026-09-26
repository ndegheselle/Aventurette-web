# 0013. Specs live in a feature's `tests/` folder, and fewer of them are written

Status: Accepted. Narrows [0009](0009-logic-lives-outside-components.md) and
[0010](0010-component-tests-over-end-to-end.md) rather than replacing either.

## Context

The activities feature reached 24 files across five folders, ten of them specs, and became
unpleasant to work in. The costs were specific, and all four are visible in the diff of the
commit that deleted them:

- **Files too small to justify a file.** `model/benefit.ts` was three lines — a type alias.
  `model/environment.ts` was thirteen. Opening the feature meant reading a directory rather
  than a file.
- **Specs for code with no decision in it.** `age.spec.ts` was 24 lines establishing that a
  four-branch formatter picks the right translation key. `activity.spec.ts` asserted that a
  factory sets the fields it literally sets. Neither could fail for a reason anyone cared
  about, and both had to be updated whenever the thing they mirrored changed.
- **Composables that were a `ref` and one call.** `useNewActivity` was 33 lines and had a
  75-line spec.
- **Specs interleaved with source.** `filters.ts` next to `filters.spec.ts` reads well in a
  guide and badly in a file tree: the folder listing was half test.

The last one compounded the others. When a folder is half specs, adding one more file is
invisible, so the granularity kept getting finer.

The counter-argument for co-location is real and was what the codebase had: a spec beside its
subject is impossible to forget about, and rot in it is visible from the folder you are already
in. That is the thing being traded away.

## Decision

**Specs live in `front/src/features/<name>/tests/`.** `model/`, `api/`, `composables/`,
`components/` and `pages/` hold production code and nothing else. Specs import through aliases
(`@features/activities/model/step`) like everything else in the codebase, not relative paths.
`npm run lint:arch` fails on a `.spec.ts` found anywhere else under a feature.

This applies to `front/src/features/`. `packages/` keeps co-located specs for now — they cover
library code where the spec *is* the documentation of the contract, and where the folders are
not the ones anyone navigates daily.

**What earns a spec:**

> A function earns a spec when it contains a **decision** — a branch over data, a dedup, a
> limit, an ordering constraint, or a translation between two shapes — such that getting it
> wrong produces a plausible, silent bug.
>
> These get none, ever: type aliases, factories that fill required fields, formatters,
> pass-through `api/` wrappers, components, and composables that are a `ref` plus one call.
>
> A composable earns one only for **multi-step orchestration with an ordering or rollback
> rule**.

The test to apply is not "is this code correct" — all of it is — but "could this be wrong in a
way review would miss". A formatter that picks between four translation keys is wrong visibly,
on screen, the first time anyone looks at it. `detachStep` unlinking a step *after* deleting it
is wrong invisibly, in a way that deletes the user's activity.

Applied to activities, ten spec files became four.

## Consequences

**What it buys.** A feature folder reads as what the feature does. The suite says something:
every spec left is a rule someone could plausibly break, so a failure is information rather
than a reminder to update a mirror. And the rule is mechanical enough to hand to the next
feature without re-litigating it each time.

**What it costs.**

- *Rot is no longer visible from the code.* A spec covering a function that has moved on is
  something you now have to go and look for. This is the real price, and nothing here mitigates
  it beyond `npm run build` typechecking the specs.
- *Coverage drops, deliberately.* The number is lower and should be. Anyone reading it as a
  target will find plenty of untested lines, and they are untested on purpose.
- *"Could this be wrong in a way review would miss" is still a judgement.* It is a narrower one
  than "should this be tested", but it is not mechanical. The lint rule enforces *where* a spec
  goes, never *whether* one exists.
- *Some real rules are only covered indirectly.* `useActivitiesEditList` has no spec of its
  own; the query it sends is covered by `buildAuthoredFilters`. If the list grows an ordering
  rule of its own, it has crossed into decision territory and earns one.

**What was not changed.** The existing `auth` and `users` specs were moved, not judged — four
of the six are component tests this rule would not write today. Deleting them is its own pass,
with its own reasoning, not a side effect of a move.
