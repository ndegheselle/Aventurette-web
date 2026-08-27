# @chapelure/ui

Vue 3 design system: Tailwind + daisyUI, with the CSS library confined to this package so it
can be replaced without touching the app.

Peer dependencies: `vue`, `vue-i18n`, `vue-router`, `tailwindcss`, `daisyui`, `lucide-vue-next`.

`vue-router` is a peer because `<Button :to>` renders a router link — the alternative was
hand-writing `<RouterLink class="btn btn-primary">` at every call site.

## Setup in a consuming app

**1. CSS.** Tailwind v4 discovers classes by scanning source and ignores `node_modules`.
Workspace packages are symlinked there, so this package's classes must be registered
explicitly or they are silently dropped from the bundle:

```css
@import "tailwindcss";

@source "../../../../packages/ui/src";   /* adjust the depth to your CSS entry */

@import "@chapelure/ui/styles/transitions.css";
@import "@chapelure/ui/styles/helpers.css";
@import "./themes.css";                  /* your brand — this package ships no theme */

@plugin "daisyui" { themes: false; }
```

Verify with `grep modal-box <your dist>/assets/*.css`.

**2. Translations.** This package ships its own strings; the app merges them:

```ts
import uiFr from '@chapelure/ui/locales/fr.json';
```

**3. Layout globals.** `useConfirmation()` and `useAlert()` are app-wide singletons that need
their host components mounted once, near the root:

```vue
<ConfirmationModal />
<AlertsContainer />
```

`useConfirmation().show()` logs and resolves to `null` — read as "cancelled" — if the modal
is missing, rather than throwing.

## Layout of the package

| Folder | |
|---|---|
| `primitives/` | Button, ButtonGroup, TextInput, InputGroup, PasswordInput, Select, Checkbox, Badge, Spinner, Skeleton |
| `layout/` | Container, Panel, Card, Steps, Step, Divider, Navbar, Footer |
| `forms/` | Field, FieldError, Fieldset, Label |
| `data/` | List, Pagination, SearchInput, TagSelect |
| `overlays/` | Modal, Dropdown, DropdownTrigger, ConfirmationModal, AlertsContainer |
| `files/` | FilesInput, FilesList, `useFiles` |
| `settings/` | SettingsMenu, `useSettings` |
| `composables/` | `useModal`, `useAlert`, `useConfirmation`, `useEditModal`, `useEditableList`, `useValidationErrors` |

Components are deep-imported; the barrel carries composables and types. Icons are imported from
`lucide-vue-next` directly, under their real names.

```ts
import Button from '@chapelure/ui/primitives/Button.vue';
import { useModal } from '@chapelure/ui';
import { XIcon } from 'lucide-vue-next';
```

`Panel` is a plain titled surface. `Card` is daisyUI's card, with `#media` / `#actions` slots.

## Patterns

**Modal driven by a promise.** `show()` resolves with the confirmed value, or `null` on
cancel:

```ts
const controller = useModal<Child>();
const result = await controller.show();   // Child | null
```

**Edit modal over a repository** — handles create vs update, loading, and field errors:

```ts
const { show, confirm, cancel, isNew, data, errors, isLoading } = useEditModal(controller, childrenRepository);
```

**Paged list.** `page` and `perPage` are two-way; `total` is a plain prop because only the
server knows it; `change` fires when a new query is needed:

```vue
<Pagination v-model:page="options.page" v-model:perPage="options.perPage"
            :total="total" @change="refresh" />
```

**Validation errors.** `useValidationErrors` consumes core's `ValidationError`, so it does not
know which backend produced the failure:

```ts
const errors = useValidationErrors();
try { await save(); } catch (e) { errors.set(e); }
// errors.get('email') -> translated message | undefined
// errors.global.value -> the fallback message
```
