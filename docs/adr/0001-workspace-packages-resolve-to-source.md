# 0001 — Workspace packages resolve to source, with no build step

**Status:** Accepted

## Context

The app is one npm workspace over three packages: `@chapelure/core`, `@chapelure/pocketbase`
and `@chapelure/ui`. The usual arrangement gives each package a build step and has the app
consume the built output.

For three packages changed as often as the app that consumes them, that arrangement means a
build to run before the app sees an edit, stale output when it is forgotten, and source maps
that point at generated files.

## Decision

Packages ship no build output. Their `exports` point at `src/`, and the app's Vite and
TypeScript configs alias each package name to its source directory.

The alias map lives in `scripts/aliases.mjs` and is imported by `front/vite.config.ts` and
`vitest.config.ts`. TypeScript cannot read a JS module for its `paths`, so
`front/tsconfig.json` repeats the same list; `npm run lint:arch` fails if the two disagree.

## Consequences

- `vue-tsc -b` in `front/` typechecks the packages along with the app: one command, one result.
- HMR crosses package boundaries — editing a `@chapelure/ui` component updates the running app.
- A stack trace points at the line that was written, not at a compiled artefact.
- The packages are not independently consumable as published artefacts. Publishing one would
  mean adding the build step this decision removes. Nothing needs that today; the packages are
  private and the workspace is their only consumer.
- Tailwind does not scan `node_modules`, and workspace packages are symlinked there. So
  `front/src/app/styles/index.css` declares `@source "../../../../packages/ui/src"` — remove it
  and every class used only inside the design system silently vanishes from the bundle.
