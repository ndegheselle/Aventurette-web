# 0018 — Code is kept only while something uses it

**Status:** Accepted

## Context

A run of changes added features, removed others, and replaced the activity attributes three
times. Each change did its own part, and none cleaned up after the one before it. A pass over
the whole codebase found:

- **Code with no caller.** The filter toolkit in `@chapelure/ui` (`CriterionField`,
  `useFilters`, `TagSelect`, `RangeInput`: 1,100 lines with their specs) stayed after the
  filter bar was deleted. The cached CRUD outlived the reference collections it served. There
  were also date helpers, `useMultipleFiles`, `getMessage` and `linkTarget`, and translations
  nothing read.
- **A feature that could not be reached.** The router stopped registering `users`, but its
  pages, composable and locales stayed, documented as if they were live.
- **Docs describing code that was gone.** `useEditableList`, `ChildrenList`, `/my-activities`,
  `buildActivityFilters`, a `home` feature, and a rule no spec asserted.
- **Code in the wrong layer.** Features imported `useNavbar` from `app/`, which points the
  dependency backwards. Authoring rules sat in the read-only `activities` model. The sidebar's
  string was in a feature's locales, and a `@chapelure/ui` component read an app translation.
- **Indirection that bought nothing.** Each auth page wrapped a single form, and the guard took
  its own feature's routes as a parameter. `useUsers` was `useAuth` under another name, and the
  UI barrel was a second way to import what everything already deep-imported.
- **A build that no longer passed.** Two unused imports failed `vue-tsc`.

No single item was expensive. Together they meant that a reader could not trust that a file was
used, that a doc was true, or that a name matched its folder, so every one had to be checked.
That checking is the fatigue this codebase is meant to avoid.

## Decision

**Code stays only while something uses it.** Every line has a reading cost, and code with no
caller has no benefit to set against it.

1. **What has no caller is deleted, in the change that removes its last caller.** This covers
   exports, components, translations, styles, test helpers and barrel entries. "It might be
   needed again" does not count as a caller: git keeps it, and the commit message says where
   to find it.
2. **Removing a feature removes all of it**: routes, pages, composables, locales, specs, the
   feature doc, and whatever it alone used in `packages/`. Anything another feature still uses
   moves to its new owner in the same change.
3. **A package exposes what the app uses.** The adapter exports the three factories that
   `backend/index.ts` wires. `@chapelure/ui` has no barrel, because every import is deep. A
   port's vocabulary may be complete where each member costs one line and the adapter already
   maps it (`FilterOperator`). A whole mechanism kept for a future caller may not.
4. **One way to do a thing.** Imports are deep, icons use their `*Icon` names, and a helper is
   written once.
5. **Flat before nested.** Collapse these on sight: a page that only wraps one component, a
   composable that only renames another, a parameter that hands a module its own constant, and
   a folder that holds one file. The path from a feature to its code is
   `feature/layer/file.ts`.
6. **Names follow the feature.** Its folder, its doc, its translation namespace and its route
   names agree: `auth.*` belongs to `features/auth`, and `activities-authoring.md` documents
   `features/activities-authoring`.
7. **Dependencies point one way, and `lint:arch` checks it.** Features never import `@/app`.
   Behaviour that both a feature and the layout need goes in `@chapelure/ui`.
8. **A comment or a doc that names something that does not exist is a bug.** It is fixed in the
   change that made it false. Comments say why. A comment that only labels the next line
   (`<!-- Navbar -->`) is deleted.

## Consequences

- **Every file is live.** Reading a file no longer starts by checking whether anything imports
  it, and the docs can be trusted as a description of the code.
- **The rules are mechanical, so they can be applied without a debate.** "Has it got a caller?"
  and "Is this name the folder's?" have yes-or-no answers, which an agent or a reviewer can
  check.
- **Bringing something back costs a `git show`.** When filters or the profile screens return,
  they come from history rather than from a folder that was waiting for them. By then they may
  no longer fit, which is also a reason not to keep them.
- **`@chapelure/ui` is not ready for a second app.** It holds what this app uses and nothing
  else. If a second consumer appears, what it needs is added then.
- **Only rule 7 is enforced.** The others rely on review, and a pass like this one is how they
  get checked. `vue-tsc` catches unused locals and `lint:arch` catches the dependency
  direction. Unused exports, translations and stale docs are caught by nothing.
- **Deleting takes more effort than leaving.** A removal has to find the specs, locales, docs
  and package code the removed feature used. That is the price of each change leaving the
  codebase as coherent as it found it.
