# 0009 — Logic lives in `model/` and `composables/`, not in components

**Status:** Accepted

## Context

Logic accumulated in `<script setup>` blocks because that is the path of least resistance. 
None of it was reachable without mounting a component, which meant none of it was cheap to
test, and the same cycle written three times had already drifted once.

The intended audience for this decision is partly automated: an agent asked to change
behaviour should have somewhere obvious to make the change and something that fails when the
change is wrong.

## Decision

Three layers, and a component is the last of them.

**`model/` — framework-free.** Rules that hold whatever renders them. Pure functions over
plain data: `buildActivityFilters` turning criteria into a query, `addResourcesWithinLimit`
enforcing a step's capacity, `withSelection` marking which interests a child has. No `vue`
import, checked by `lint:arch`.

**`composables/` — Vue, no markup.** Reactive state and orchestration: which criteria are
applied versus being edited, what to load on mount, what to do when a form is submitted.
Reaches the backend only through the feature's `api/`.

**Components — wiring and markup.** Bindings, event handlers that call a composable, and the
template. A handful of lines of `<script setup>`, ideally none of them a decision.

A component still owns what is genuinely presentational: `ageDisplay` in `ActivitiesFilters`
is a `computed` over a formatter, and belongs there.

## Consequences

- Most behaviour is testable as a function call. The rule that a search matches name *or*
  description is a three-line assertion, not a mounted component and a click.
- Component tests are then free to be about the component: that the modal seeds its inputs,
  that a badge appears, that the right event carries the right payload.
- Reuse follows: `useSubmit` came out of two forms and `useEditModal` now shares it, so the
  cycle exists once.
- It is more files. A feature that used to be one component is now a model function, a
  composable, and a component — worth it where there is a rule to protect, and overhead where
  there is not. A component with no logic in it needs no composable.
- Destructuring a composable in `<script setup>` is deliberate: a ref reached through an object
  is not unwrapped in a template, only a top-level binding is.
