# Architecture

An npm workspace: one app (`front/`) on top of three packages (`packages/`).
`npm run lint:arch` checks the rules below on every build.

This describes the code as it stands. *Why* it is this way is in
[docs/adr/](docs/adr/README.md) — one file per decision, including the costs each one accepts.
What each feature does is in [docs/features/](docs/features/README.md), and how to test any of
it is in [docs/testing.md](docs/testing.md).

```
Aventurette-web/
├── packages/
│   ├── core/          @chapelure/core        contracts. no framework, no backend, no deps
│   ├── pocketbase/    @chapelure/pocketbase  the backend adapter
│   └── ui/            @chapelure/ui          shared behaviour (Vue): modals, lists, filters
├── front/             @sagace/front          the app
├── tests/                                    the test toolkit: builders, fakes, mount helpers
├── docs/                                     ADRs, feature docs, testing guide
├── back/                                     PocketBase data and migrations
└── nginx/                                    TLS termination and API proxy
```

## Dependency direction

```
front/app  ──►  front/features  ──►  @chapelure/ui  ──►  @chapelure/core
                      │                                        ▲
                      └──► front/backend ──► @chapelure/pocketbase
```

Within a feature, the same applies one level down:

```
pages/ ──► components/ ──► composables/ ──► api/ ──► @/backend
                                 └────────► model/
```

Nothing points left. `core` imports nothing of ours; `ui` never learns which backend exists;
the app's `backend/` folder is the only thing that does.

## Where things live

### `front/src`

| Folder | Holds | Notes |
|---|---|---|
| `app/` | `main.ts`, `router.ts`, `i18n.ts`, `App.vue`, `layouts/`, `styles/` | Composition root. Wiring, no logic. |
| `backend/` | `index.ts`, `schema.g.ts` | The backend seam, and the pocketbase-typegen output. |
| `features/<name>/` | one vertical slice | Same shape every time, see below. |

Every feature has the same shape, so you never have to guess:

| | |
|---|---|
| `model/` | types, factories, domain rules — **no framework imports** |
| `api/` | `*.api.ts` — the only place `@/backend` may be imported |
| `composables/` | Vue state and orchestration — reaches the backend only through `api/` |
| `components/` | feature components |
| `pages/` | route targets, plus the structural files only they use — see below |
| `tests/` | the feature's specs, and the only place they may live |
| `locales/` | translations, and nothing else |
| `routes.ts` | the route records plus a `routesNames` map |

Where behaviour goes between these is the one thing worth reading before writing any:
`model/` holds rules that hold whatever renders them, `composables/` holds reactive state, and
a component is wiring and markup. [ADR 0009](docs/adr/0009-logic-lives-outside-components.md)
has the reasoning; a feature with no logic needs no composable.

Within a folder the unit is an **entity or a screen, not a concept**: `model/activity.ts` holds
the activity's types, factory, enums and formatters together, and `useActivitiesList` owns the
list screen — its results, its filters and its add button. Splitting finer than that was tried
and produced `model/benefit.ts`, three lines long.

Specs do **not** sit beside what they cover. They live in the feature's `tests/`, and there are
fewer of them than there were — [ADR 0013](docs/adr/0013-specs-live-in-a-feature-tests-folder.md)
says which code earns one.

#### `pages/`

A file belongs in `pages/` when nothing outside its own folder — or that folder's children —
has a reason to import it. Route targets qualify by definition; so does the layout wrapping
them, and the odd component that exists only to cut one page into readable pieces. The moment
a second part of the feature wants that component, it is no longer scoped to the page and
belongs in `components/`.

Three markers, so a filename says which it is:

| | |
|---|---|
| `Name.page.vue` | a route target — something `routes.ts` names as a `component` |
| `_layout.vue` | the layout wrapping this folder's pages and those of its children |
| `_folder/` | scoped to this folder's pages, and not itself part of the route tree |

`_` reads as "structural, not a page". It also floats these to the top of the file list in
VS Code.

One layout to a folder is just `_layout.vue`. A folder that needs several names them —
`_Edit.layout.vue`, `_Preview.layout.vue` — and keeps the prefix.

### `packages/ui`

`modals/`, `alerts/`, `dropdown/`, `data/`, `filter/`, `files/`, `forms/`, `settings/`,
`layout/`, `styles/` and `locales/`.

A folder is one family and holds everything that family is made of — `modals/` has `Modal.vue`
next to `useModal`, `dropdown/` has the `v-click-outside` directive it is the only user of.
There is no `composables/` or `directives/` folder: a composable sits with the components it
drives, which is also where you look for it.

This is not a design system — it is the behaviour the app should not hand-write twice:
`<Modal>` owning a promise, `<FilesInput>` validating what was dropped on it, `<Pagination>`
and its two-way page state, `useEditModal` sequencing a create-or-update.

Styling is not its job. A component whose whole body was a daisyUI class with a props table
in front of it does not belong here, however typed that props table was: `<Button
variant="primary" size="sm">` mapped to `btn btn-primary btn-sm` and bought only the
indirection, so the app writes the classes. What survives in `layout/` and `forms/` is
there for something else — `<Panel>` for a surface repeated a dozen times, `<PasswordInput>`
for its reveal toggle, `<TextEditor>` for the tiptap instance it owns and tears down.

Components are deep-imported so bundlers can drop what is unused:

```ts
import Modal from '@chapelure/ui/modals/Modal.vue';
```

Icons come straight from `lucide-vue-next`, by their real names, everywhere:

```ts
import { XIcon } from 'lucide-vue-next';
```

## The rules, and what each one buys

| Rule | Migration it enables |
|---|---|
| `@chapelure/pocketbase` is imported only by `front/src/backend/index.ts` | Change backend = rewrite one file plus one package |
| The `pocketbase` SDK appears only inside `packages/pocketbase` | ditto |
| `@/backend` is imported only from `features/*/api/**` | Components never hold a backend client |
| `features/*/composables` never import `@/backend` | A composable is Vue, but still not where a client belongs |
| `packages/core` imports no `vue`, no SDK, no app | Contracts survive any framework or backend change |
| `features/*/model` and `features/*/api` import no framework | Domain and data survive a framework change |
| `packages/ui` imports neither the app nor the adapter | The design system stays reusable |
| Nothing that ships imports `@tests` or the SDK test double | Builders and fakes stay out of the bundle |
| A feature's `.spec.ts` files are all under its `tests/` | Source folders list source, not half tests |
| `scripts/aliases.mjs` and the `paths` in `front/tsconfig.json` agree | The two resolvers cannot drift apart |

Three deliberate compromises:

- **daisyUI classes are written where they are used**, component classes (`btn`, `modal`,
  `card`…) included. Confining them to `packages/ui` was a lint rule once, and it held — by
  breeding wrapper components that existed only to hold the class being hidden. Twenty of them
  were deleted and their classes inlined, `<Button>` and its 50 call sites included. The cost
  is real: a variant is a class you have to know rather than a prop autocomplete offers you,
  and swapping the CSS library became a find-and-replace across the app instead of a
  `packages/ui` job. The gain is that a component reads as the markup it produces, and that
  `packages/ui` now holds only behaviour — which is what it is actually good at.
- **`lucide-vue-next` is imported wherever an icon is used.** A re-export barrel would confine
  it to one file, but it also hides which icons exist: with the real names in the imports, an
  icon is findable by its own name, in this codebase and in lucide's documentation alike.
  Swapping icon sets is a find-and-replace over the import lines.
- **The view layer is Vue, and stays Vue.** The achievable goal is that `core/`,
  `features/*/model` and `features/*/api` are framework-free — roughly the part of a
  framework migration that is worth protecting. Components would be rewritten either way.

## Mechanics worth knowing

- **Packages are source-only.** No per-package build step: `exports` and the aliases point at
  `src/`, so `vue-tsc` typechecks them with the app and HMR works across package boundaries.
  The alias map lives in `scripts/aliases.mjs` and is imported by `front/vite.config.ts` and
  `vitest.config.ts`. TypeScript cannot read a JS module for its `paths`, so
  `front/tsconfig.json` repeats it — and `lint:arch` fails if the two disagree.
- **Relations come back inlined, not on the side.** PocketBase returns expanded records in a
  separate `expand` object; `packages/pocketbase/src/relations.ts` folds them into the record
  on read and turns them back into ids on write, so `activity.steps` is the steps in both
  directions. Models declare that with `Expanded<Response, { ... }>` from `@chapelure/core`,
  and the fields they list must match the `relations` argument the api layer passes — nothing
  checks the two against each other. Saving a parent still persists ids only.

- **Tailwind v4 ignores `node_modules`,** and workspace packages are symlinked there. So
  `front/src/app/styles/index.css` declares `@source "../../../../packages/ui/src"`. Remove
  it and every class used only inside the design system silently vanishes from the bundle.
  Check with `grep modal-box front/dist/assets/*.css`.
- **i18n**: the design system ships `packages/ui/src/locales/*.json` and the app imports it
  explicitly; feature translations are globbed from `features/**/locales/*.json`. The merge
  is recursive, so two files sharing a top-level key do not clobber each other.
- **Docker builds from the repository root**, not `front/`, because the app needs
  `packages/`: `docker build -f front/Dockerfile .`

## Tests

Vitest on happy-dom, with Vue Test Utils. The suite is component-level: no browser, no running
backend, seconds to run — see [ADR 0010](docs/adr/0010-component-tests-over-end-to-end.md) for
what that covers and what it does not.

Three things about it are unusual enough to mention here, all deliberate:

- **There are fewer specs than you may expect, and coverage is not a target.** A spec is
  written for code with a decision in it — a branch, a dedup, a limit, an ordering constraint.
  Formatters, factories, type aliases, `api/` wrappers and components get none
  ([ADR 0013](docs/adr/0013-specs-live-in-a-feature-tests-folder.md)).
- **Vue warnings fail the test that produced them.** A prop of the wrong type or a missing
  injection is a failure, not console noise.
- **Components mount against the app's real translations**, so an assertion reads as what a
  user would see. Completeness is not enforced: locales may be uneven and an untranslated key
  renders as its own path
  ([ADR 0011](docs/adr/0011-tests-fail-on-vue-warnings.md)).

The toolkit — builders, in-memory fakes for the `@chapelure/core` ports, and the mount
helpers — is in `tests/`, imported as `@tests`, and cannot reach the bundle.
[docs/testing.md](docs/testing.md) is the guide.

## Commands

```bash
npm run dev            # dev server
npm run build          # vue-tsc -b && vite build, typechecks packages and specs too
npm run test           # the suite
npm run test:watch     # the suite, while working
npm run test:coverage  # with a coverage report
npm run lint:arch      # the rules above
npm run check          # lint:arch + build + test — what CI runs
```
