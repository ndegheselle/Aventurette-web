# 0002 — The backend sits behind ports in `@chapelure/core`

**Status:** Accepted

## Context

The backend is PocketBase, reached through its JavaScript SDK. The SDK's types and its record
shapes are easy to let spread: a component that imports the client to build a file url, a
model that types itself against the SDK's response class, a form that catches the SDK's error
object and reads `response.data` out of it. Each is small, and together they are the reason a
backend migration stops being possible.

## Decision

`@chapelure/core` declares what the app needs as interfaces, with no implementation and no
dependency of its own: `IDataCrud` and its `CrudFactory`, `IAuthProvider`, `IFileUrlResolver`,
`ValidationError`, and the backend-neutral `Filter`/`FilterGroup` vocabulary.

`@chapelure/pocketbase` implements them. It is the only place the `pocketbase` SDK is imported.

`front/src/backend/index.ts` wires the two together and is the only file in the app that names
the adapter. Features reach it through their own `api/` folder and nothing else.

Errors cross the seam normalised: the adapter turns an SDK rejection into `ValidationError`
with per-field codes, and returns `undefined` for anything that is not one — so a network
failure is rethrown rather than mislabelled as a validation error.

## Consequences

- Changing backend means rewriting `front/src/backend/index.ts` and writing one new adapter
  package. Nothing else in the app has an opinion about which backend exists.
- Tests fake the port rather than the SDK — see [0012](0012-fakes-at-the-port-not-the-sdk.md).
- Some of the SDK's abilities are not reachable without widening a port first. That is the
  intended friction: it puts the question in one place instead of at the call site.
- `Expanded<>` in core mentions `expand` by name, which is PocketBase's word for its relation
  side-channel. It is the one backend term in the package, and it saves every model from
  having to omit the field by hand.
