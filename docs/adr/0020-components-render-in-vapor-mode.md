# 0020 — Components render in Vapor mode

**Status:** Accepted

## Context

Vue 3.6 adds Vapor mode: a component compiled straight to DOM operations, with no virtual DOM.
It is smaller and faster to update, and needs `<script setup>` and the Composition API — which
every component here already used.

## Decision

**Every SFC is `<script setup vapor>`**, and the app starts with `createVaporApp`. Vue is
pinned to the 3.6 release candidate (`overrides` in the root `package.json` keeps one copy).
Dependencies that ship VDOM components — vue-router's `RouterView`, lucide icons, tiptap's
`EditorContent` — run through `vaporInteropPlugin`.

## Consequences

- Vapor has no `globalProperties`, so a template cannot use `$t`. A component that translates
  takes `const { t } = useI18n()`. `$slots` is `useSlots()` or what `defineSlots()` returns.
- A custom directive is a function, `(el, value) => cleanup`, not an object of hooks:
  see `vClickOutside`.
- vue-tsc types a Vapor component as a function, so `InstanceType<typeof Comp>` does not
  compile. Let `useTemplateRef('name')` infer the type from the template.
- `@vue/test-utils` cannot mount a Vapor component as its root. `mount` from `@tests` renders it
  inside a VDOM host and points `emitted` and `props` back at it. Vitest resolves Vue's ESM
  builds, since the CJS ones carry no Vapor runtime.
- Vue 3.6 is a release candidate. Move to the stable release when it ships.
