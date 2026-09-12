# 0011 — Tests use the real translations and fail on warnings

**Status:** Superseded by [0013](0013-translations-may-be-incomplete.md)

> The half of this decision about Vue warnings still stands. The half about translations was
> reversed: locales are allowed to be uneven, and an untranslated key is not a test failure.
> Read [0013](0013-translations-may-be-incomplete.md) for the position that holds today.

## Context

Two failure modes are invisible in this app. A missing translation renders as its own key path
— `activities.fields.age` on the button — which no assertion about behaviour would catch. And
Vue's warnings (a prop of the wrong type, a missing injection, a broken template ref) go to a
console nobody reads during a test run.

Both are exactly what an automated change gets wrong: it adds a feature and forgets the `fr`
file, or passes a prop the component does not declare.

## Decision

Components mount against the app's real catalogue, built by the same `@/app/messages` the app
uses, at locale `en`. Tests assert on English copy.

`tests/setup.ts` captures `console.warn` and `console.error` during each test and fails it if
anything matched `[Vue warn]`, `[intlify]`, or vue-i18n's missing-key message. Output is still
printed, because a silenced console makes a failing test much harder to read. Exceptions go in
an `ALLOWED` list with a comment saying why — it is empty today.

`tests/locales.spec.ts` checks the catalogue directly: that `en` and `fr` hold the same key
set, that no key is an empty string, and that the glob picking up feature translations still
matches something.

## Consequences

- A forgotten translation fails a test, in either locale, without anyone writing a test for it.
- A prop or injection mistake fails at the test that caused it rather than being discovered in
  the browser.
- Assertions are coupled to English copy, so rewording a string breaks a test. This is the real
  cost. It is accepted because the assertions that matter are on behaviour, and because a test
  that would have to change is a test that was checking what the user reads.
- Adding a locale means the parity test starts requiring it to be complete. That is the
  intent, and the reason to add locales deliberately.
- The guard caught two real defects while it was being written: a broken `<RouterLink>` stand-in
  in the test helpers, and `useAuth` reaching for the router outside a component — which was
  warning on every guarded navigation in the running app.
