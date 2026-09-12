# 0011 — Tests fail on Vue warnings, and use the real translations

**Status:** Accepted

## Context

Vue's warnings — a prop of the wrong type, a missing injection, a bad template ref — go to a
console nobody reads during a test run. They are exactly what an automated change gets wrong,
and they accumulate silently.

The related question is what a test should render against. A stubbed translator returning key
paths makes assertions independent of copy; the app's real catalogue makes them read as what a
user would actually see.

## Decision

**Vue warnings fail the test that produced them.** `tests/setup.ts` captures `console.warn` and
`console.error` during each test and fails it on anything matching `[Vue warn]`. Output is still
printed, because a silenced console makes a failing test much harder to read. Exceptions go in
an `ALLOWED` list with a comment saying why — it is empty today.

**Components mount against the app's real catalogue**, at locale `en`, so assertions are on the
copy a user would read.

**Translation completeness is not enforced.** vue-i18n's own warnings are deliberately *not* in
the fatal list, and nothing requires `en` and `fr` to hold the same keys. An untranslated key
renders as its own path and fails nothing.

That last point was decided the other way at first, with vue-i18n's missing-key warning fatal
and a spec requiring the two locales to match. It was reversed. The app is French-first with
English alongside, and the two do not move in step: a feature gets written in one locale and
translated later, if at all. Making that ordinary sequence a red build left two options each
time — stop and translate, or write a placeholder string to get past the gate — and a wrong
translation is invisible in a way a key path is not. A build that goes red for something the
author already knows about and has decided to defer teaches people to work around the gate.

## Consequences

- A prop or injection mistake fails at the test that caused it rather than being found in the
  browser. This caught two real defects while it was being written: a broken `<RouterLink>`
  stand-in in the test helpers, and `useAuth` reaching for the router outside a component —
  which was warning on every guarded navigation in the running app.
- Assertions are coupled to English copy, so rewording a string breaks a test. Accepted,
  because a test that would have to change is one that was checking what the user reads.
- A missing translation is invisible, in the browser and in a test alike. That is the cost of
  the reversal above, taken knowingly.
- A key missing from `en` is not silent, because `fallbackLocale` is `fr`: it renders in French.
  A component test asserting on English copy will fail on it — not as a completeness check, but
  because the assertion no longer matches. The failure reads as a wrong-copy mismatch rather
  than a missing key, which is worth knowing when one turns up.
- If the gap becomes a problem, the cheap thing to add is a spec that *reports* the uneven keys
  without failing the build. A report is a different thing from a gate, and would not have the
  workaround-inducing effect that motivated the reversal.
