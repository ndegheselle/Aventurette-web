# 0006 — The view layer is Vue, and stays Vue

**Status:** Accepted

## Context

[0002](0002-backend-behind-core-ports.md) protects the app from a change of backend. The
matching question is whether to protect it from a change of framework — abstracting components
behind a view-agnostic layer so that Vue could be replaced.

## Decision

No. The view layer is Vue and is expected to stay Vue. The achievable goal is narrower and is
enforced instead: `@chapelure/core`, every feature's `model/`, and every feature's `api/`
import no framework at all. `npm run lint:arch` checks it.

## Consequences

- The part of a framework migration that is worth protecting — domain rules, contracts, and the
  code that talks to the backend — survives one untouched. Components would be rewritten in any
  case, whatever abstraction sat in front of them.
- Composables are Vue, deliberately. Framework-free logic goes in `model/`; `composables/` is
  where it meets reactivity. That split is what makes most logic testable without mounting
  anything — see [0009](0009-logic-lives-outside-components.md).
- `model/` sometimes takes a small structural type instead of importing Vue's or vue-i18n's.
  `Translate` in `features/activities/model/activity.ts` is one: a two-line function type standing
  in for `ComposerTranslation`, so a formatter can take a translator without the model layer
  importing vue-i18n.
