# 0010 — The suite is component tests, not end-to-end

**Status:** Accepted

## Context

The app had no tests at all. The goal is a net that makes automated changes safe to accept,
which means it has to be fast enough to run on every change and precise enough that a failure
names the cause.

End-to-end tests in a real browser have the highest fidelity. They also need PocketBase
running with known data, they are slow, they flake, and a failure says "the page did not load"
rather than which function is wrong — which is the worst possible feedback for an agent about
to make a second attempt.

## Decision

Vitest, on happy-dom, with Vue Test Utils. One config at the root, sharing the app's own alias
map so a test resolves an import exactly as the browser will. Specs live beside what they
cover.

Three kinds of test, in the order they should be reached for:

1. **Pure** — `model/`, `@chapelure/core`, the adapter's query building and relation mapping.
   No mounting, no mocks, microseconds each.
2. **Composable** — mounted with `withSetup`, with the feature's `api/` module faked. Covers
   state transitions: applied versus draft criteria, what is loaded on mount, retry after
   failure.
3. **Component** — mounted and driven by clicking and typing, asserting on what is rendered and
   what is emitted. Reserved for the wiring: does the button open the modal, does the error
   reach the field.

No end-to-end suite for now.

## Consequences

- The whole suite runs in seconds, so `npm run check` is a gate and not a chore.
- A failure points at a function.
- Specs are typechecked with the app: a spec that no longer compiles fails `npm run build`.
- Nothing covers the wiring between real screens — the router, the guard against real
  navigation, the actual PocketBase schema. A route that is never registered, or a collection
  renamed in `back/`, is not caught here. That is the known gap, and where a small end-to-end
  suite should go first if this is revisited.
- happy-dom is not a browser. Layout, real drag-and-drop, and `<dialog>`'s modal semantics are
  approximations; `Modal.spec.ts` asserts that `show()` and `close()` are called, not that
  anything is visible.
