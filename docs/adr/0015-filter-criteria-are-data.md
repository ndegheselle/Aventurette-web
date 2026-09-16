# 0015 — Filter criteria are data, and the form is generated from them

**Status:** Accepted

## Context

The activity list's filters were written three times over. `ActivityCriteria` was a flat object
with one field per input; `<ActivitiesFilters>` had a hand-written fieldset per criterion;
`buildActivityFilters` had a `createFilter` line per criterion; and the toolbar had a button per
criterion it could display, with a badge standing in for the ones it could not.

Adding a filter therefore meant four edits that nothing checked against each other, and the
toolbar could only ever show what someone had written markup for — which is how it came to show
age and environment and hide duration and benefits behind a badge reading `1`.

## Decision

A criterion is data. `model/criteria.ts` declares what one is: a key, a label, the type of input
it takes, the record fields it constrains, the values it offers and the value it holds.
`activityCriteria()` is the list of them, and the form, the chips above the list and the query
are all generated from that list.

Three types cover what the screen needs — `range`, `options` and `tags` — and a criterion
carries what it means to the backend, so the query builder knows no field names.

The icon stays out of the model: it is a Vue component, and `model/` may not import the view
layer. `useActivitiesList` hangs one on each criterion by key.

The mechanism is feature-local. It is generic enough to move to `@chapelure/core` the day a
second screen filters anything, and there is no reason to widen the shared surface before then.

## Consequences

- A filter is an entry in one list. It appears in the modal, in the chips and in the query at
  once, or in none of them — the three cannot drift.
- Every applied criterion is displayable, so the chips show what is narrowing the list instead
  of an indicator that something is.
- The form is a `v-for` over criteria and a `v-if` over three types. A fourth type is a branch
  in `CriterionField.vue` and a case in `criterionFilters` — which is the cost of the trade: an
  input that is none of the three is more work than a hand-written fieldset would have been.
- A criterion's value is typed by its type, not by its field, so `criteria.ageMin` is now
  `criteria[0].value.min`. Reaching one by name means finding it by key.
- What was tested as one query builder is now tested twice: the mechanism without any activity
  in sight, and the activity's own list of criteria against the query it produces.
