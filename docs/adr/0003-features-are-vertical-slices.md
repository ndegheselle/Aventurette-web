# 0003 — Features are vertical slices with a fixed folder shape

**Status:** Accepted

## Context

The alternative is layering by kind — all components together, all types together, all
requests together. It reads well in a file tree and badly in practice: one change touches four
distant folders, and nothing says which parts belong to each other.

## Decision

`frontend/web/src/features/<name>/` holds everything one feature is, and every feature has the same
shape, so there is never a question of where something goes:

| Folder | Holds | Constraint |
|---|---|---|
| `models/` | types, factories, domain rules | no framework imports |
| `api/` | `*.api.ts` | the only place `@/backend` may be imported |
| `composables/` | Vue state and orchestration | reaches the backend only through `api/` |
| `ui/` | the feature's Vue files: route targets, `Name.page.vue`, and the components they use | — |
| `locales/` | translations, and nothing else | — |
| `routes.ts` | the route records plus a `routesNames` map | — |

Pages and components had a folder each when this was written. They share `ui/` now: the
files of one screen sit together, and a subfolder (`ui/activity/`) groups an entity's
components when there are several.

Specs sat next to what they cover when this was written. They live in the feature's
`tests/` folder now — see [0013](0013-specs-live-in-a-feature-tests-folder.md).

## Consequences

- A feature is deletable: remove the folder and its line in the router.
- The layout of a feature never has to be explained; it is the layout of every other feature.
- Cross-feature imports are possible and not forbidden — `activities-authoring` reads the session from `user`.
  A feature may import any of another's `models/`, `composables/` and `ui/`. The cost: with
  pages and components in one folder, nothing stops a feature importing another's page, and
  nothing flags it.
