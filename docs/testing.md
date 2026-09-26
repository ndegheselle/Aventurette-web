# Testing

```bash
npm run test            # once
npm run test:watch      # while working
npm run test:coverage    # with a coverage report
npm run check           # boundaries, typecheck and build, then tests — what CI runs
```

Specs live in their feature's `tests/` folder — `features/activities-authoring/tests/step.edit.spec.ts`
covers `features/activities-authoring/model/step.edit.ts`. They import through aliases like everything else,
and `npm run lint:arch` fails on a `.spec.ts` found anywhere else under a feature. They are
typechecked with the app, so a spec that no longer compiles fails `npm run build`.

`packages/` is the exception and keeps co-located specs: there the spec is the documentation of
a contract, and the folders are not ones anyone navigates daily.

## Which tests to write

The question is not "is this code correct" — it all is — but **"could this be wrong in a way
review would miss"**. That narrows to code with a decision in it:

> A function earns a spec when it contains a **decision** — a branch over data, a dedup, a
> limit, an ordering constraint, or a translation between two shapes — such that getting it
> wrong produces a plausible, silent bug.
>
> These get none, ever: type aliases, factories that fill required fields, formatters,
> pass-through `api/` wrappers, components, and composables that are a `ref` plus one call.
>
> A composable earns one only for **multi-step orchestration with an ordering or rollback
> rule**.

A formatter choosing between four translation keys is wrong *visibly*, on screen, the first
time anyone looks at it. `detachStep` unlinking a step after deleting it instead of before is
wrong *invisibly*, in a way that takes the whole activity with it. Only the second is worth a
spec. The reasoning, and what the rule costs, is in
[ADR 0013](adr/0013-specs-live-in-a-feature-tests-folder.md).

The `activities` feature has two specs for a dozen files, and that is the intended ratio — not
a gap to fill. Coverage is a diagnostic, never a target.

## Which kind of test to write

Once something has earned a spec: reach for the cheapest kind that can express the rule. Most
behaviour should be testable without mounting anything — that is what
[ADR 0009](adr/0009-logic-lives-outside-components.md) is for.

**Pure** — `model/`, `@chapelure/core`, the adapter. Import the function, call it, assert.
No mounting, no mocks.

```ts
it('narrows to one state when a tab is picked', () => {
    const group = buildAuthoredFilters(ActivityState.DRAFT);
    expect(valueOf(group, 'state')).toBe(ActivityState.DRAFT);
});
```

**Composable** — orchestration with an order to it. `withSetup` runs it inside a real component
instance, which composables using `onMounted` or `inject` need.

```ts
const [subject] = withSetup(() => useActivityEdit(), router);
```

**Component** — the wiring, and rarely. Mount it, click and type, assert on what is rendered
and emitted. A component spec has to justify itself against the rule above: "it renders" is not
a decision. Rules belong a layer down.

## The toolkit

Everything is re-exported from `@tests`, which is test-only — `npm run lint:arch` fails if
anything that ships imports it.

**Builders** (`tests/builders.ts`) fill a complete, valid record and take an override for the
one or two fields the test is about:

```ts
const activity = anActivity({ name: 'Treasure hunt', state: ActivityState.PUBLISHED });
```

`anActivity`, `aStep`, `aMaterial`, `aResource`, `aUser`, and `aPickedFile` for an upload that
has no record yet.

They build **entities** — what everything above `api/` works on. The `*Payload` builders
(`anActivityPayload`, `aStepPayload`, …) build the backend's shape instead, relation ids and
all, and only a mapper's spec has a reason to reach for one
([ADR 0007](adr/0007-models-map-their-own-payloads.md)).

**Fakes** (`tests/fakes.ts`) implement the `@chapelure/core` ports, never the SDK
([ADR 0012](adr/0012-fakes-at-the-port-not-the-sdk.md)). A feature reaches the backend only
through its `api/` module, so swapping it is one line:

```ts
const activities = fakeCrud<ActivityData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },   // a getter: vi.mock is hoisted above the const
}));
```

`fakeCrud` holds `items` to arrange a case or assert on a write, records `lastFilter` so a test
can check *what was asked for*, and `failNextWith({ email: { code: 'validation_required' } })`
arms the next write to fail the way a backend rejection does. `fakeAuthProvider` and
`fakeFileUrls` are the same idea for the other two ports.

**Mounting** (`tests/mount.ts`). Plain `mount` already carries i18n and a `<RouterLink>`
stand-in. Use `mountWithRouter` when the subject navigates or reads a route param:

```ts
const { wrapper, router } = await mountWithRouter(LoginPage, {
    initialRoute: '/login',        // somewhere that is not the destination
});
```

It returns the router, so assert where a navigation landed rather than that a function was
called. `<RouterLink>` stays stubbed even then — navigate with `router.push`.

## Vue warnings are failures

Any `[Vue warn]` during a test fails it — a prop of the wrong type, a missing injection, a bad
template ref. A missing injection usually means the subject needs `mountWithRouter`. The list
is in `tests/setup.ts`; add to its `ALLOWED` only for a warning that is genuinely the
environment talking, with a comment saying which.

vue-i18n's warnings are **not** in that list. An untranslated key renders as its own path and
fails nothing ([ADR 0011](adr/0011-tests-fail-on-vue-warnings.md)).

## Translations are real, but not required to be complete

Components mount against the app's own catalogue at locale `en`, so assertions read as what a
user would see. Nothing requires `en` and `fr` to hold the same keys.

One thing to know when a copy assertion fails oddly: `fallbackLocale` is `fr`, so a key missing
from `en` renders in French rather than as a key path. The failure reads as a wrong-copy
mismatch, not as a missing translation.

## Gotchas

- `vi.mock` is hoisted above every `const` in the file. Reference a fake through a getter, as
  above, or the mock factory reads it before it exists.
- `defineModel` does not emit when the value is unchanged. A handler that decides to take
  nothing emits nothing — assert `toBeUndefined()`, not an unchanged array.
- Setting `stubs: { RouterLink: false }` does not fall back to the real component; it leaves
  nothing to render.
- A ref reached through an object is not unwrapped in a template. Destructure a composable in
  `<script setup>`.
- `front/src/backend/index.ts` refuses to load without `VITE_API_URL`, and a deep component
  tree pulls it in through some feature's api module. `vitest.config.ts` sets a fake one. A
  client that is constructed but never called is harmless; anything that would actually reach
  the network fails loudly, which is the reminder to mock that feature's api module.

## What is not covered

No end-to-end suite. Nothing exercises the real router against real screens, the guard against
real navigation, or the actual PocketBase schema — so a route that is never registered, or a
collection renamed in `back/`, is not caught here. That is the known gap, and where a small
Playwright suite should go first if this is revisited.
