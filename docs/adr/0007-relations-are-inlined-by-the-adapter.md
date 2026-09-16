# 0007 — Relations are inlined by the adapter

**Status:** Superseded by [0017](0017-models-map-their-own-payloads.md) — the folding moved from
the adapter into each model's mapper, which also resolves file urls.

## Context

PocketBase answers a read with related records in a separate `expand` object, keyed by relation
name, leaving the record's own field holding ids. So `activity.steps` is ids and
`activity.expand.steps` is the steps — and which of the two is populated depends on what the
request asked to expand.

Left as-is, every consumer has to know that shape, and every template that walks a relation has
to reach through `expand`.

## Decision

The adapter folds `expand` into the record on the way out and turns records back into ids on
the way in. `packages/pocketbase/src/relations.ts` is the whole of it. Downstream,
`activity.steps` is the steps, in both directions.

Models declare that with `Expanded<Response, { ... }>` from `@chapelure/core`.

## Consequences

- Components and models see one shape. Nothing outside the adapter mentions `expand`.
- Reads and writes are not symmetric, and this is the thing to know: a relation field may carry
  whole records, but saving the parent persists their ids and nothing else. Editing a step is a
  write to the steps collection.
- The fields listed in `Expanded<>` must match the `relations` argument the api layer passes to
  the CRUD factory, and **nothing checks the two against each other**. Declare exactly what the
  call asks for, or the type lies. `ACTIVITY_RELATIONS` sits next to `ActivityData` in the same
  file for this reason.
- An unexpanded relation, and a to-many relation that matched nothing, both keep their ids —
  PocketBase omits an empty relation from `expand` rather than sending back an empty array.
