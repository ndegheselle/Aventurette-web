# 0004 — The back office is drawn with shadcn-vue's components

**Status:** Accepted

## Context

The back office was styled with daisyUI, its classes written at the call site. The clients' app
is Flutter on forui ([ADR 0024](0024-mobile-app-uses-forui-theme.md)), which is a port of
shadcn/ui: same colour roles (`background`, `muted`, `border`, `destructive`…), same components,
same neutral theme. Two libraries meant two looks for one product, and two vocabularies for
whoever works on both apps.

shadcn-vue is shadcn/ui for Vue, on reka-ui's headless primitives. It is not a package: its
components are copied into the codebase and owned there.

## Decision

The back office uses **shadcn-vue's components and its neutral theme**, the same theme the
mobile app takes from forui. Tailwind stays for layout and spacing.

- **The components are vendored** in `@chapelure/ui`, under `packages/ui/src/shadcn/<name>/`
  (new-york-v4 style), and imported as `@chapelure/ui/shadcn/<name>`. Their imports are
  rewritten to the workspace's aliases, and their icons to `lucide-vue-next`
  ([ADR 0005](0005-icons-imported-directly.md)). They keep upstream's formatting so a diff
  against the registry stays readable; a local change is marked `Patched:` in the file.
- **A component is used where shadcn has one; Tailwind utilities do the rest.** A variant is a
  prop (`<Button variant="outline" size="sm">`), an exception a class, merged by `cn`. There
  are no wrappers of our own over shadcn's components to rename a variant or fix a class.
- **The palette is the app's**: `admin/src/app/styles/themes.css` holds shadcn's neutral
  values, `.dark` on `<html>` switches them, and `.light`/`.dark` scope a subtree.
  `packages/ui/src/styles/shadcn.css` holds what the components need from any palette — the
  Tailwind colours mapped to the variables, the radii, the dark variant.
- `@chapelure/ui`'s own components keep their job — behaviour: `<Modal>` owning a promise,
  `<FilesInput>` validating what was dropped, `<Pagination>` and its page state. They are
  drawn with the shadcn components.

## Consequences

- One look and one vocabulary across the two apps: a screen designed for one reads the same in
  the other, and a colour role means the same thing in both.
- No success, info or warning colour, as in forui. A warning is drawn in `destructive`.
- A component's markup is in the repository, so it can be read, debugged and changed — and its
  upstream fixes have to be pulled by hand. The registry is at
  `https://shadcn-vue.com/r/styles/new-york-v4/<name>.json`.
- reka's overlays (dialog, popover, dropdown, tooltip) are portalled to `<body>` and render only
  while open. A spec on one mounts with `attachTo: document.body` and opens it first.
- Swapping the component library again is a rewrite of every screen's markup, as this change
  was. That is the accepted cost.
