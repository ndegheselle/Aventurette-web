# Working in this repository

An npm workspace: the `front/` Vue app on three packages in `packages/`, with a PocketBase
backend in `back/`. Read [ARCHITECTURE.md](ARCHITECTURE.md) first — it is short, and the
boundaries it describes are enforced.

## Before you finish

```bash
npm run check     # lint:arch + build (typecheck) + test
```

All three must pass. `npm run build` typechecks the specs along with the app, so a spec that no
longer compiles fails the build.

## Where code goes

The one rule to internalise: **a component is wiring and markup.** Logic goes one or two layers
down, which is what makes it testable without mounting anything.

| Layer | Holds | May import |
|---|---|---|
| `features/<name>/model/` | rules that hold whatever renders them — pure functions over plain data | `@chapelure/core`, other models. **No `vue`.** |
| `features/<name>/api/` | the feature's backend calls | `@/backend`. **No `vue`.** |
| `features/<name>/composables/` | reactive state and orchestration | `vue`, the feature's `api/` and `model/` |
| `features/<name>/components/` | markup and bindings | anything above |
| `features/<name>/pages/` | route targets, and what only they use | anything above |
| `features/<name>/tests/` | the feature's specs — and the only place they may live | anything |

Adding behaviour usually means: a pure function in `model/`, then a line in a composable, then
a binding in the template. If you find yourself writing a `computed` that makes a decision
inside `<script setup>`, it belongs in `model/`.

**One file per entity or screen, not per concept.** `model/activity.ts` holds the activity's
types, its factory, its enums and its formatters together; `model/step.ts` does the same for a
step and the materials and resources hanging off it. A three-line type alias is not a file.
A composable covers a screen — `useActivitiesList` owns the list, its filters and its add
button — rather than one slice of one.

Full reasoning in [ADR 0009](docs/adr/0009-logic-lives-outside-components.md); the rest of the
decisions are in [docs/adr/](docs/adr/README.md), and each feature is documented in
[docs/features/](docs/features/README.md).

## Writing tests

[docs/testing.md](docs/testing.md) is the guide. In short:

- **Specs live in `features/<name>/tests/`**, never beside what they cover. `lint:arch` fails
  on a `.spec.ts` anywhere else under a feature.
- **Write one only for code with a decision in it** — a branch over data, a dedup, a limit, an
  ordering constraint, a translation between two shapes. Type aliases, factories, formatters,
  `api/` wrappers, components and one-call composables get none. A composable earns a spec only
  for multi-step orchestration with an ordering or rollback rule
  ([ADR 0013](docs/adr/0013-specs-live-in-a-feature-tests-folder.md)).
- Prefer a pure test over a mounted one. Mount only to test the wiring.
- Import builders, fakes and mount helpers from `@tests`.
- Fake the **port**, never the SDK: `vi.mock` the feature's `api/` module with a `fakeCrud`.
- Use `mountWithRouter` when the subject navigates or reads a route param.

A **Vue warning** fails a test on purpose — a wrong prop type, a missing injection. vue-i18n's
warnings do not: an untranslated key renders as its own path and fails nothing
([ADR 0011](docs/adr/0011-tests-fail-on-vue-warnings.md)). Components still mount against the
app's real catalogue, so assertions are on the copy a user would read.

## Conventions

- **Four-space indent**, single quotes, semicolons. Match the file you are in.
- **daisyUI classes are written at the call site** — no wrapper components for styling
  ([ADR 0004](docs/adr/0004-daisyui-classes-at-the-call-site.md)).
- **Icons** come straight from `lucide-vue-next` by their real names
  ([ADR 0005](docs/adr/0005-icons-imported-directly.md)).
- **Imports are non-relative** across folders: `@/`, `@features/`, `@chapelure/*`.
- **Every user-facing string is a translation key**, in the feature's `locales/`. Add it to
  both `en.json` and `fr.json` where you can — but this is a convention, not a gate, and a
  locale is allowed to lag. `fr` is the fallback, so a key missing from `en` renders in French.
- **Destructure a composable** in `<script setup>` — a ref reached through an object is not
  unwrapped in a template.
- Comments explain *why*, not what. The codebase's existing comments are the register to match.

## Things that will bite

- `ACTIVITY_RELATIONS` and what `Expanded<>` declares on `ActivityData` must match, and nothing
  checks them against each other ([ADR 0007](docs/adr/0007-relations-are-inlined-by-the-adapter.md)).
- Relations read as records but **write as ids**. Saving a parent does not save its children.
- Most relations in the schema have **`cascadeDelete` on, and it points the other way than you
  would guess**: deleting a record deletes whatever points at it, and only once that leaves the
  pointing record with no references left. Deleting an activity's *last* step deletes the
  activity; deleting a material takes every step it was the only material of. Unlink first,
  then delete.
- Adding an alias means adding it in `scripts/aliases.mjs` *and* `front/tsconfig.json`;
  `lint:arch` fails if they drift.
- Tailwind does not scan `node_modules`, so `front/src/app/styles/index.css` declares
  `@source` for `packages/ui/src`. Removing it silently drops every class used only there.
- A new route is private by default — `features/auth/guard.ts` whitelists login and register
  only.

## Scope

Do what was asked. If you find something else broken, say so rather than fixing it in the same
change — and if a fix is unavoidable, keep it in its own commit with the reason.

Known gaps are listed under **Not finished** in each feature's document. They are known; do not
fix them as a side effect of something else.
