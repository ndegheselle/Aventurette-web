# 0004 — daisyUI classes are written where they are used

**Status:** Accepted

## Context

The ui should be reusable and separated as much possible from a specific library possible. 
However, it should not be hidden behind simples styles wrapper.

## Decision

daisyUI classes are written at the call site, component classes included.

`@chapelure/ui` keeps only behaviour: `<Modal>` owning a promise, `<FilesInput>` validating
what was dropped on it, `<Pagination>` and its two-way page state, `useEditModal` sequencing a
create-or-update. What survives in `layout/` and `primitives/` is there for a reason other than
styling - `<Panel>` for a surface repeated a dozen times, `<PasswordInput>` for its reveal
toggle.

## Consequences

- A component reads as the markup it produces. There is no indirection to follow to find out
  what `variant="primary"` becomes.
- `@chapelure/ui` holds only what it is actually good at, which makes it worth reusing.
- A variant is a class you have to know, not a prop autocomplete offers you.
- Swapping the CSS library became a find-and-replace across the app rather than a
  `@chapelure/ui` job. That is the accepted cost, and it is why this is written down.
