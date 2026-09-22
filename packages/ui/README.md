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

A folder is one family, and it holds everything that family is made of — the components and
the composable driving them together, the way `settings/` holds `SettingsMenu` next to
`useSettings`. There is no `composables/` or `directives/` folder to look in.

| Folder | |
|---|---|
| `modals/` | Modal, ConfirmationModal, `useModal`, `useConfirmation`, `useEditModal` |
| `alerts/` | AlertsContainer, `useAlert` |
| `dropdown/` | Dropdown, DropdownTrigger, `vClickOutside` |
| `data/` | List, Pagination, SearchInput, TagSelect |
| `filter/` | CriterionField, `useFilters`, and the criterion model the two run on |
| `files/` | FilesInput, FilesList, `useFiles` |
| `forms/` | Field, FieldError, PasswordInput, RangeInput, TextEditor, `useSubmit`, `useValidationErrors` |
| `settings/` | SettingsMenu, `useSettings` |
| `layout/` | Container, Panel |

Components are deep-imported; the barrel carries composables and types. Icons are imported from
`lucide-vue-next` directly, under their real names.

```ts
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui';
import { XIcon } from 'lucide-vue-next';
```

`Container` is the page shell, `Panel` a titled surface. `PasswordInput`, `RangeInput` and
`TextEditor` are the inputs left: one for its reveal toggle, one for its two thumbs that stop at
each other, one for the tiptap instance it owns and tears down — none for the `input` class.

```vue
<RangeInput class="text-primary" :floor="0" :ceiling="18"
            v-model:min="age.min" v-model:max="age.max" />
```

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

**Filters generated from criteria.** A criterion is data — a label, an icon, the kind of input
it takes and the field it constrains — and the form, the chips and the query all come from the
same list. Declaring one is the whole of adding a filter:

```ts
const criteria = [
    rangeCriterion({ key: 'age', label: 'fields.age', icon: BabyIcon,
                     display: 'age', minField: 'ageMin', maxField: 'ageMax' }),
    tagsCriterion({ key: 'benefits', label: 'fields.benefits', icon: TrendingUpIcon,
                    field: 'benefits', operator: FilterOperator.AnyEquals }),
];

const filters = useFilters(criteria, refresh);        // applied / draft / search
const query = criteria.flatMap(criterionFilters);     // into a core FilterGroup
```

`applied` is what the list is showing and `draft` what the modal is editing; `applyDraft()`
moves one to the other and calls back. Render a field with `<CriterionField :criterion>`, and a
chip with `describeCriterion(t, criterion)`.

**Validation errors.** `useValidationErrors` consumes core's `ValidationError`, so it does not
know which backend produced the failure:

```ts
const errors = useValidationErrors();
try { await save(); } catch (e) { errors.set(e); }
// errors.get('email') -> translated message | undefined
// errors.global.value -> the fallback message
```
