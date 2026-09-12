# 0013 — Translations may be incomplete

**Status:** Accepted — supersedes the translation half of
[0011](0011-tests-fail-on-warnings-and-missing-translations.md)

## Context

[0011](0011-tests-fail-on-warnings-and-missing-translations.md) made two things fail a test: a
Vue warning, and an untranslated key. The second was enforced twice over — vue-i18n's
missing-key warning was in the fatal list, and a spec required `en` and `fr` to hold exactly the
same key set.

The reasoning was that a missing translation is invisible: the key renders as its own path and
no assertion about behaviour would catch it.

That is true, and it is not worth the price. The app is French-first with English alongside,
and the two do not move in step: a feature gets written in one locale and translated later, if
at all. Under 0011 that ordinary sequence was a red build — so the choice each time was to stop
and translate, or to write a placeholder string to get past the gate. The second is worse than
the gap it hides, because a wrong translation is invisible in a way a key path is not.

A build that goes red for something the author already knows about and has decided to defer
teaches people to work around the gate.

## Decision

Translation completeness is not enforced.

- vue-i18n's warnings are out of the fatal list in `tests/setup.ts`. Vue's own warnings stay:
  a prop of the wrong type or a missing injection is still a defect, and still fails.
- The `en`/`fr` parity spec is gone. What remains in `front/src/app/messages.spec.ts` is about
  the merge — that two files sharing a top-level key do not clobber each other — plus a check
  that the glob picking up feature translations still matches something. Neither says anything
  about whether a locale is complete.
- Tests still mount against the app's real catalogue. That is unchanged and is about assertions
  reading as what a user would see, not about completeness.

Adding a string to both `en.json` and `fr.json` remains the convention. It is now a convention
and not a gate.

## Consequences

- A feature can land in one locale and be translated later, without a red build in between and
  without inventing a placeholder string to get past one.
- A missing translation is invisible again: the key renders as its own path, in the browser and
  in a test alike. That is the accepted cost, and it is the reason 0011 existed.
- A key missing from `en` is not silent, because `fallbackLocale` is `fr`: it renders in French.
  A component test asserting on English copy will fail on it — not as a completeness check, but
  because the assertion no longer matches. The failure will read as a wrong-copy mismatch rather
  than as a missing key, which is worth knowing when one turns up.
- A key missing from **both** locales renders as its own path, and nothing fails.
- If this becomes a problem in practice, the cheap version to reintroduce is the parity spec
  alone, reporting the gaps without the warning guard — a report is a different thing from a
  gate, and would not have the workaround-inducing effect that motivated this.
