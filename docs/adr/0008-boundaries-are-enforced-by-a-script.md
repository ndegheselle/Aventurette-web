# 0008 — The boundaries are enforced by a script, not by convention

**Status:** Accepted

## Context

The rules in the ADRs above are worth having only if they hold. Written down but unchecked,
they last until the first hurried change: one component importing `@/backend` directly is
invisible in review and never comes back out on its own.

An ESLint plugin with import restrictions is the conventional answer. It also means a lint
config, a plugin, a resolver, and their upgrades — for what is, at bottom, half a dozen rules.

## Decision

`scripts/lint-arch.mjs` walks the source files and greps each one. Every rule is a predicate
over a file's path and text, with a name and a `why` printed on failure. `npm run lint:arch`
runs them; `npm run check` runs it before the build.

The rules, and what each buys, are tabulated in `ARCHITECTURE.md`.

## Consequences

- The rules are cheap and approximate on purpose. They catch a boundary being crossed; they are
  not a type system, and a determined violation gets through.
- Adding a rule is adding an object to an array, so a new boundary gets enforced the day it is
  agreed rather than the day someone configures a plugin.
- One rule checks something greps normally cannot: that `scripts/aliases.mjs` and the `paths` in
  `front/tsconfig.json` still list the same aliases. They describe the same thing in two places
  because TypeScript will not read a JS module for its `paths` — so drift between them is a
  real failure mode, and this is what catches it.
- A rule that fails names the offending files and says why the rule exists, so the fix does not
  require reading this document.
