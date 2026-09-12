# 0005 — Icons are imported directly from lucide

**Status:** Accepted

## Context

`lucide-vue-next` is imported by name wherever an icon is used. A re-export barrel would
confine the dependency to one file, which is the usual argument for adding one.

## Decision

No barrel. Icons are imported from `lucide-vue-next` by their real names, everywhere:

```ts
import { XIcon } from 'lucide-vue-next';
```

## Consequences

- An icon is findable by its own name, in this codebase and in lucide's own documentation
  alike. A barrel hides which icons exist and adds a second name for each one.
- Tree-shaking works without anything special.
- Swapping icon sets is a find-and-replace over the import lines. For a dependency that renders
  glyphs and has no other API, that is a cheaper trade than the indirection.
