# Testing

```bash
npm run test            # once
npm run test:watch      # while working
npm run test:coverage    # with a coverage report
npm run check           # boundaries, typecheck and build, then tests — what CI runs
```

Specs live next to what they cover: `filters.ts` and `filters.spec.ts` in the same folder.
They are typechecked with the app, so a spec that no longer compiles fails `npm run build`.

## Which kind of test to write

Reach for the cheapest one that can express the rule. Most behaviour should be testable
without mounting anything — that is what
[ADR 0009](adr/0009-logic-lives-outside-components.md) is for.

**Pure** — `model/`, `@chapelure/core`, the adapter. Import the function, call it, assert.
No mounting, no mocks.

```ts
it('searches name and description, either of which may match', () => {
    const group = buildActivityFilters(emptyCriteria(), 'hunt');
    expect(leaves(group).map(f => f.key)).toEqual(['name', 'description']);
});
```

**Composable** — state and orchestration. `withSetup` runs it inside a real component instance,
which composables using `onMounted` or `inject` need.

```ts
const [filters] = withSetup(() => useActivityFilters(onChange));
```

**Component** — the wiring. Mount it, click and type, assert on what is rendered and emitted.
Keep these about the component: that the modal seeds its inputs, that the error reaches the
field, that the right event carries the right payload. Rules belong a layer down.

## The toolkit

Everything is re-exported from `@tests`, which is test-only — `npm run lint:arch` fails if
anything that ships imports it.

**Builders** (`tests/builders.ts`) fill a complete, valid record and take an override for the
one or two fields the test is about:

```ts
const activity = anActivity({ name: 'Treasure hunt', ageMin: 6, ageMax: 10 });
```

`anActivity`, `aStep`, `aMaterial`, `aResource`, `aBenefit`, `aChild`, `anInterest`, `aUser`,
and `aPickedFile` for an upload that has no record yet.

**Fakes** (`tests/fakes.ts`) implement the `@chapelure/core` ports, never the SDK
([ADR 0012](adr/0012-fakes-at-the-port-not-the-sdk.md)). A feature reaches the backend only
through its `api/` module, so swapping it is one line:

```ts
const benefits = fakeCrud<BenefitData>();

vi.mock('@features/activities/api/benefits.api', () => ({
    get benefitsApi() { return benefits; },   // a getter: vi.mock is hoisted above the const
}));
```

`fakeCrud` holds `items` to arrange a case or assert on a write, records `lastFilter` so a test
can check *what was asked for*, and `failNextWith({ email: { code: 'validation_required' } })`
arms the next write to fail the way a backend rejection does. `fakeAuthProvider` and
`fakeFileUrls` are the same idea for the other two ports.

**Mounting** (`tests/mount.ts`). Plain `mount` already carries i18n and a `<RouterLink>`
stand-in. Use `mountWithRouter` when the subject navigates or reads a route param:

```ts
const { wrapper, router } = await mountWithRouter(LoginForm, {
    props: { registerRoute: 'register' },
    initialRoute: '/login',        // somewhere that is not the destination
});
```

It returns the router, so assert where a navigation landed rather than that a function was
called. `<RouterLink>` stays stubbed even then — assert on link targets with `linkTarget`, and
navigate with `router.push`.

## Vue warnings are failures

Any `[Vue warn]` during a test fails it — a prop of the wrong type, a missing injection, a bad
template ref. A missing injection usually means the subject needs `mountWithRouter`. The list
is in `tests/setup.ts`; add to its `ALLOWED` only for a warning that is genuinely the
environment talking, with a comment saying which.

vue-i18n's warnings are **not** in that list. An untranslated key renders as its own path and
fails nothing ([ADR 0013](adr/0013-translations-may-be-incomplete.md)).

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
