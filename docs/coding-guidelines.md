# Coding guidelines

The goal is a codebase that is cheap to read: every file is used, every doc is true, and every
name matches its folder. Every line has a reading cost, so a line with nothing using it is pure
cost.

[ARCHITECTURE.md](../ARCHITECTURE.md) says where code goes. This says what to keep, and how to
write it.

## Keep only what is used

- **Delete what has no caller, in the change that removes its last caller.** This covers
  exports, components, translations, styles, test helpers and docs. "It might be needed again"
  is not a caller: git keeps it, and the commit message says where to find it.
- **Remove a feature whole**: its routes, pages, composables, locales, specs, feature doc, and
  whatever it alone used in `packages/`. Anything another feature still uses moves to its new
  owner in the same change.
- **A package exposes what the app uses.** `@chapelure/pocketbase` exports the three factories
  `backend/index.ts` wires. `@chapelure/ui` has no barrel, because every import is deep. A
  port's vocabulary may be complete when each member costs one line (`FilterOperator`). A
  whole mechanism kept for a future caller may not.

## Keep it flat and direct

- **One way to do a thing.** Imports are deep, icons use their `*Icon` names, and a helper is
  written once.
- **Flat before nested.** Collapse these on sight: a page that only wraps one component, a
  composable that only renames another, a parameter that hands a module its own constant, and
  a folder that holds one file. The path to any code is `feature/layer/file`.
- **Dependencies point one way.** The app composes features, and a feature never imports
  `@/app`. Behaviour that both a feature and the layout need goes in `@chapelure/ui`.

## Keep names and words true

- **Names follow the feature.** Its folder, doc, translation namespace and route names agree:
  `auth.*` belongs to `features/auth`, and `activities-authoring.md` documents
  `features/activities-authoring`.
- **Comments say why.** A comment that only labels the next line (`<!-- Navbar -->`) is
  deleted.
- **A comment or doc that names something that does not exist is a bug.** Fix it in the change
  that made it false.

## What checks this

`vue-tsc` fails on unused locals, and `npm run lint:arch` fails on a feature importing
`@/app`. Nothing catches an unused export, an unread translation or a stale doc, so those are
for review — and for the change that removes something to clean up after itself.
