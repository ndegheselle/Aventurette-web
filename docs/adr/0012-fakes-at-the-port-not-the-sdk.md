# 0012 — Tests fake the port, never the SDK

**Status:** Accepted

## Context

A test needs the backend to answer. The usual approach is to intercept at the transport —
mock `fetch`, or stub the PocketBase SDK — which means every test knows the wire format, and a
change of backend invalidates the whole suite along with the code.

## Decision

Fakes implement the `@chapelure/core` ports, in `tests/fakes.ts`: `fakeCrud` is an in-memory
`IDataCrud`, `fakeAuthProvider` an `IAuthProvider`, `fakeFileUrls` an `IFileUrlResolver`.

A feature reaches the backend only through `features/<name>/api/*.api.ts`
([0002](0002-backend-behind-core-ports.md)), so swapping it is one `vi.mock` of that module:

```ts
vi.mock('@features/activities/api/activities.api', () => ({
    get benefitsApi() { return benefits; },
}));
```

The adapter itself is tested separately, against `packages/pocketbase/src/testing.ts` — a fake
written to the SDK's real method names, so those specs exercise the options the adapter
actually passes.

## Consequences

- Feature tests are written in the app's own vocabulary. `crud.failNextWith({ email: { code:
  'validation_invalid_email' } })` says what happened; a stubbed HTTP 400 does not.
- Nothing outside `packages/pocketbase` would change if the backend did.
- The fakes are shallow by design. `fakeCrud.filter` records the group it was given and returns
  everything — it is not a filter engine, because the query language is the adapter's
  responsibility and is tested there. A test asserts *what was asked for*, not what a
  reimplementation of PocketBase would have returned.
- The fakes could drift from the real adapter's behaviour. What limits it is that both
  implement the same interface, so a change to a port fails to typecheck on both sides.
- `lint:arch` fails if anything outside a spec imports `@tests` or the SDK fake, so neither can
  reach the bundle.
