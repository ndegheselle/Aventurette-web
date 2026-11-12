# 0021. The mobile app mirrors the web's slices and layers

Status: Accepted. Carries [0002](0002-backend-behind-core-ports.md),
[0003](0003-features-are-vertical-slices.md), [0007](0007-models-map-their-own-payloads.md),
[0008](0008-boundaries-are-enforced-by-a-script.md) and
[0009](0009-logic-lives-outside-components.md) over to Dart.

## Context

The web's structure was argued for decision by decision, and it held: a newcomer finds any
code by its feature, then by its layer. A second app with another structure would double what
a developer has to know to move between the two.

## Decision

`frontend/mobile/lib/` has the web's shape, layer for layer:

| Web | Mobile | Holds |
|---|---|---|
| `@chapelure/core` | `core/` | the ports: `DataCrud`, `CrudFactory`, `AuthProvider`, `EntityMapper`, filters |
| `@chapelure/pocketbase` + `web/src/backend` | `backend/` | the adapter, and the providers exposing the ports |
| `@chapelure/ui` | `ui/` | shared behaviour widgets, and the theme |
| `features/<name>/models` | same | entities and rules, plain Dart |
| `features/<name>/api` | same | the mappers and the calls, plain Dart |
| `features/<name>/composables` | `features/<name>/state` | Riverpod notifiers, one per screen |
| `features/<name>/ui` | same | pages and their widgets |
| `web/src/app` | `app/` | `WidgetsApp`, the router, the dock shell |

**State is Riverpod 3, without code generation.** A provider is the seam a spec overrides — the
api's or the crud port's — which is what `vi.mock` with a `fakeCrud` does on the web. No
codegen means no `build_runner` step to run or forget.

**`api/` may import `riverpod`** (the plain-Dart package, not `flutter_riverpod`): it declares
the provider exposing its calls. It still imports no Flutter.

`tool/check_architecture.dart` checks the boundaries on every `check`, as `lint-arch.mjs` does.

## Consequences

- One mental model for both apps. The cost is a few Dart patterns that would not be anyone's
  first choice in Flutter alone: a `models/` folder with no `freezed`, an `api/` layer where a
  Flutter app would often call the client from a repository.
- Dart has no partial type. A write sends the entity through its mapper on create, but an
  update sends columns, written by `api/` — the only layer that knows them.
- Riverpod becomes a dependency of `api/`, for its providers only.
