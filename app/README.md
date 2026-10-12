# Aventurette — Flutter app

The mobile counterpart of [`front/`](../front): same features, same layers, same PocketBase
backend. The rules are the repository's — [ARCHITECTURE.md](../ARCHITECTURE.md),
[docs/coding/guidelines.md](../docs/coding/guidelines.md) and the [ADRs](../docs/adr/README.md) —
carried over to Flutter. This file only says what changes.

## Running

```bash
cp env.example.json env.json     # API_URL: the PocketBase server (10.0.2.2 from an Android emulator)
flutter pub get
flutter run --dart-define-from-file=env.json
```

Before finishing — the counterpart of `npm run check`:

```bash
dart run tool/lint_arch.dart && flutter analyze && flutter test lib
```

`flutter test lib`, not bare `flutter test`: specs live in their feature's `tests/` folder, under `lib/`.

## Layout

```
lib/
├── core/        contracts. no Flutter, no backend            ← packages/core
├── backend/     the backend seam and its PocketBase adapter  ← backend/ + packages/pocketbase
├── ui/          shared behaviour: submit, pagination, range  ← packages/ui
├── testing/     builders and fakes, test-only                ← tests/
├── app/         main wiring: router, i18n, layouts, locales  ← front/src/app
└── features/<name>/     one vertical slice, the same shape as front
    ├── model/           rules, pure Dart                     ← no flutter
    ├── api/             *.api.dart and *.mapper.dart         ← the only place `backend/` is imported
    ├── composables/     use_*.dart: reactive state           ← a ChangeNotifier
    ├── components/      widgets
    ├── pages/           name.page.dart
    ├── tests/           the feature's specs
    ├── locales/         en.json, fr.json — the same files as front
    └── routes.dart      the routes plus a `routesNames` record
```

`tool/lint_arch.dart` enforces the boundaries on every check: `model/` and `api/` import no
Flutter, `composables/` no widgets, only `api/` imports `backend/`, only `backend/` imports
`package:pocketbase`, specs only in `tests/`, no relative imports.

## What translates how

| front | app |
|---|---|
| `Name.page.vue` | `name.page.dart` (Dart files are snake_case; the `.page` / `.mapper` / `.api` / `.layout` suffixes stay) |
| `useThing.ts` | `use_thing.dart`, a `UseThing extends ChangeNotifier`; the page listens with `ListenableBuilder` |
| `ref` / `computed` | a field and a getter, then `notifyListeners()` |
| `EntityMapper<Payload, Entity>` | `EntityMapper<Entity>` over a `JsonMap` payload; the payload's columns are documented on the mapper |
| `*.spec.ts` | `*_test.dart`, in the same `tests/` folder |
| `@chapelure/*`, `@/`, `@features/` | `package:aventurette/...`, imported absolutely |
| `$t('a.b')` | `context.t('a.b')`; the catalogue is every `locales/*.json`, merged recursively, `fr` as fallback |
| `vue-router` guard | `go_router` redirect calling `authGuard` |
| daisyUI classes | Material 3 widgets at the call site, no wrapper components |
| `lucide-vue-next` | `lucide_icons_flutter`, imported where used |

A mapper whose entity is also written is a `WritableMapper`, and its collection is opened with
`writableCrud`. Reads need neither: the activity side of the app is read-only.

A new `locales/` folder has to be listed under `assets:` in `pubspec.yaml`.

## Ported

- **user** — login, register, settings (display name, log out), the session, the route guard.
- **activities** — the public list with search and pagination, one activity in full, and running
  it step by step with the generated steps and ticking actions.
- **dashboard** — the placeholder page.

## Not ported

- **activities-authoring** and **catalogue-authoring** — the admin editor and the catalogues.
  Their mappers' `toPayload`, `create`/`remove` on the crud port and the batch port will come
  with them. `routeRoles` in `features/user/guard.dart` is where their roles go.
- Theme and language menus: the app follows the device (`fr` when the device language is not
  translated).
- OAuth2 buttons and "stay signed in", which front renders but does not wire either.
- The development account front pre-fills in its forms is **not** copied: the fields start empty.
- Images: front shows placeholders, so does the app — no picture or resource file is fetched yet.
  Resources show as names; `resource.url` is ready for when they open.
