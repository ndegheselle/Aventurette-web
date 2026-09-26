# @chapelure/ui

Vue 3 behaviour library: the components and composables that are worth *not* hand-writing —
promise-driven modals, a paged list, file input with validation, alerts, settings.

It is deliberately not a design system. Anything whose whole job was to put a daisyUI class on
an element lives at the call site instead: the app writes `<button class="btn btn-primary">`,
not `<Button variant="primary">`. What earns a file here is behaviour — `<Modal>` owning a
promise, `<FilesInput>` validating what was dropped on it, `useEditModal` sequencing a
create-or-update — or a composition the app repeats, like `<Panel>`'s surface.

Peer dependencies: `vue`, `vue-i18n`, `tailwindcss`, `daisyui`, `lucide-vue-next`.

## Setup in a consuming app

**1. CSS.** Tailwind v4 discovers classes by scanning source and ignores `node_modules`.
Workspace packages are symlinked there, so this package's classes must be registered
explicitly or they are silently dropped from the bundle:

```css
@import "tailwindcss";

@source "../../../../packages/ui/src";   /* adjust the depth to your CSS entry */

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

A folder is one family, and it holds everything that family is made of — the components and
the composable driving them together, the way `settings/` holds `SettingsMenu` next to
`useSettings`. There is no `composables/` or `directives/` folder to look in.

| Folder | |
|---|---|
| `modals/` | Modal, ConfirmationModal, `useModal`, `useConfirmation`, `useEditModal` |
| `alerts/` | AlertsContainer, `useAlert` |
| `dropdown/` | Dropdown, DropdownTrigger, `vClickOutside` |
| `data/` | List, Pagination, SearchInput |
| `files/` | FilesInput, FilesList, `useOneFile` |
| `forms/` | Field, FieldError, PasswordInput, TextEditor, `useSubmit`, `useValidationErrors` |
| `settings/` | SettingsMenu, `useSettings` |
| `layout/` | Container, Panel |

Everything is deep-imported, components and composables alike — there is no barrel. Icons are
imported from `lucide-vue-next` directly, under their real names.

```ts
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { XIcon } from 'lucide-vue-next';
```

`Container` is the page shell, `Panel` a surface. `PasswordInput` and `TextEditor` are the inputs
left: one for its reveal toggle, one for the tiptap instance it owns and tears down — none for
the `input` class.

## Patterns

**Modal driven by a promise.** `show()` resolves with the confirmed value, or `null` on
cancel:

```ts
const controller = useModal<Step>();
const result = await controller.show();   // Step | null
```

**Edit modal over a repository** — handles create vs update, loading, and field errors:

```ts
const { show, confirm, cancel, isNew, data, errors, isLoading } = useEditModal(controller, stepsApi);
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
