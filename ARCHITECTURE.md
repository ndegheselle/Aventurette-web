# Architecture

An npm workspace: one app (`front/`) on top of three packages (`packages/`).
`npm run lint:arch` checks the rules below on every build.

```
Aventurette-web/
├── packages/
│   ├── core/          @chapelure/core        contracts. no framework, no backend, no deps
│   ├── pocketbase/    @chapelure/pocketbase  the backend adapter
│   └── ui/            @chapelure/ui          shared behaviour (Vue): modals, lists, files
├── front/             @sagace/front          the app
├── back/                                     PocketBase data and migrations
└── nginx/                                    TLS termination and API proxy
```

## Dependency direction

```
front/app  ──►  front/features  ──►  @chapelure/ui  ──►  @chapelure/core
                      │                                        ▲
                      └──► front/backend ──► @chapelure/pocketbase
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

Every feature has the same six folders, so you never have to guess:

| | |
|---|---|
| `model/` | types, factories, domain rules — **no framework imports** |
| `api/` | `*.api.ts` — the only place `@/backend` may be imported |
| `components/` | feature components |
| `pages/` | route targets, and nothing else |
| `locales/` | translations, and nothing else |
| `routes.ts` | the route records plus a `routesNames` map |

### `packages/ui`

`overlays/`, `data/`, `files/`, `forms/`, `composables/`, `settings/`, `layout/`,
`primitives/` (just PasswordInput), `directives/`, `styles/` and `locales/`.

This is not a design system — it is the behaviour the app should not hand-write twice:
`<Modal>` owning a promise, `<FilesInput>` validating what was dropped on it, `<Pagination>`
and its two-way page state, `useEditModal` sequencing a create-or-update.

Styling is not its job. A component whose whole body was a daisyUI class with a props table
in front of it does not belong here, however typed that props table was: `<Button
variant="primary" size="sm">` mapped to `btn btn-primary btn-sm` and bought only the
indirection, so the app writes the classes. What survives in `layout/` and `primitives/` is
there for something else — `<Panel>` for a surface repeated a dozen times, `<PasswordInput>`
for its reveal toggle.

Components are deep-imported so bundlers can drop what is unused:

```ts
import Modal from '@chapelure/ui/overlays/Modal.vue';
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
| `packages/core` imports no `vue`, no SDK, no app | Contracts survive any framework or backend change |
| `features/*/model` and `features/*/api` import no framework | Domain and data survive a framework change |
| `packages/ui` imports neither the app nor the adapter | The design system stays reusable |

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

- **Packages are source-only.** No per-package build step: `exports` and the aliases in
  `front/tsconfig.json` + `front/vite.config.ts` point at `src/`, so `vue-tsc` typechecks
  them with the app and HMR works across package boundaries. Keep those two alias lists in
  sync.
- **Tailwind v4 ignores `node_modules`,** and workspace packages are symlinked there. So
  `front/src/app/styles/index.css` declares `@source "../../../../packages/ui/src"`. Remove
  it and every class used only inside the design system silently vanishes from the bundle.
  Check with `grep modal-box front/dist/assets/*.css`.
- **i18n**: the design system ships `packages/ui/src/locales/*.json` and the app imports it
  explicitly; feature translations are globbed from `features/**/locales/*.json`. The merge
  is recursive, so two files sharing a top-level key do not clobber each other.
- **Docker builds from the repository root**, not `front/`, because the app needs
  `packages/`: `docker build -f front/Dockerfile .`

## Commands

```bash
npm run dev         # dev server
npm run build       # vue-tsc -b && vite build, typechecks packages too
npm run lint:arch   # the rules above
npm run check       # lint:arch + build
```
