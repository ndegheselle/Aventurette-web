# Chapelure

Vue 3 + TypeScript UI library providing authentication, data management, modals, alerts, and i18n for PocketBase-backed applications.

---

## Dependencies

- Vue 3 + Vue Router + Vue i18n
- Tailwind CSS + DaisyUI
- PocketBase JS SDK
- lucide-vue-next

---

## Setup

### 1. Environment Variable

```env
VITE_API_URL=http://localhost:8090
```

### 2. CSS (`src/style.css`)

```css
@import "tailwindcss";
@import "@chapelure/common/styles/transitions.css";
@import "@chapelure/common/styles/themes.css";
@import "@chapelure/common/styles/helpers.css";

@plugin "daisyui" {
    themes: false;
}
```

### 3. `main.ts`

```ts
import './style.css';
import { initDatabase } from '@chapelure/api/pocketbase';
import { authGuard } from '@chapelure/auth/guard';
import { i18n } from '@chapelure/common/i18n';
import { applyDefaultBehaviors } from '@chapelure/common/utils/dom';
import { routesNames } from '@features/users/routes';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './routes';

initDatabase(import.meta.env.VITE_API_URL);

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(authGuard(routesNames));

createApp(App)
    .use(i18n)
    .use(router)
    .mount('#app');

applyDefaultBehaviors();
```

| Call | Purpose |
|---|---|
| `initDatabase(url)` | Connects to PocketBase |
| `authGuard(routesNames)` | Redirects unauthenticated users to login |
| `i18n` | Enables translations (auto-loads all `features/**/locales/*.json`) |
| `applyDefaultBehaviors()` | Auto-closes `<details>` elements on outside click |

### 4. Default Layout (`src/layouts/Default.vue`)

The default layout must include `ConfirmationModal` and `AlertsContainer` — these are **global singletons** required for the `useConfirmation()` and `useAlert()` composables to work anywhere in the app.

```vue
<template>
    <div class="min-h-screen flex flex-col">
        <nav class="navbar bg-base-300">
            <!-- your navbar -->
            <SettingsMenu />
        </nav>

        <main class="flex flex-1">
            <RouterView />
        </main>

        <footer class="footer bg-base-300">
            <!-- your footer -->
        </footer>

        <!-- Required globals -->
        <ConfirmationModal />
        <AlertsContainer />
    </div>
</template>

<script setup lang="ts">
import AlertsContainer from '@chapelure/common/components/popups/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/common/components/popups/ConfirmationModal.vue';
import SettingsMenu from '@chapelure/common/components/navbar/SettingsMenu.vue';
</script>
```

To support route transitions, read `route.meta.transition` and wrap `<RouterView>` with `<Transition>`:

```vue
<RouterView v-slot="{ Component }">
    <Transition :name="route.meta.transition ?? 'slide'">
        <component :is="Component" />
    </Transition>
</RouterView>
```

Add the `transition` type declaration in `src/env.d.ts` or any `.d.ts` file:

```ts
// already in @chapelure/common/routes.d.ts — imported automatically
declare module 'vue-router' {
    interface RouteMeta {
        transition?: string;
    }
}
```

### 5. Routes (`src/routes.ts`)

Wrap your routes under the Default layout and include the auth routes:

```ts
import Default from '@/layouts/Default.vue';
import { routes as userRoutes } from '@features/users/routes';

export default [
    {
        path: '/',
        component: Default,
        children: [
            { path: '', component: () => import('@/pages/Home.vue') },
            ...userRoutes,
        ],
    },
];
```

Auth route names (`routesNames.login`, `routesNames.register`) must be provided to `authGuard` so it knows which routes to skip protection on.

---

## Auth

### Protecting routes

`authGuard` automatically redirects to login for any route that is not `routesNames.login` or `routesNames.register`.

### Using auth state in components

```ts
import { useAuth } from '@chapelure/auth/composables/useAuth';

const { current, isLoggedIn, login, logout, register } = useAuth();
```

### Login / Register pages

Use the ready-made form components:

```vue
<LoginForm :register-route="routesNames.register" />
<RegisterForm :login-route="routesNames.login" />
```

---

## Data Layer

### Creating a CRUD service

```ts
import { PocketbaseCrud } from '@chapelure/api/pocketbase';

interface Product extends BaseEntity {
    name: string;
    price: number;
}

export const products = new PocketbaseCrud<Product>('products');
```

### Using in a page

```ts
import { usePageActions } from '@chapelure/common/composables/data/usePageActions';

const editModal = ref<InstanceType<typeof EditModal>>();
const { list, total, refresh, create, edit, remove } = usePageActions(products, (item) => {
    editModal.value?.show(item);
});
```

Pair with `TablePaginatedSearch` or `ListPaginatedSearch` and `EditModal` for a complete CRUD page.

---

## Composables Reference

| Composable | Import | Usage |
|---|---|---|
| `useAlert()` | `@chapelure/common/composables/popups/alert` | `alert.success('Saved')` |
| `useConfirmation()` | `@chapelure/common/composables/popups/confirmation` | `await confirm.show('Delete?', 'Are you sure?')` |
| `useSettings()` | `@chapelure/common/composables/settings` | Theme & language switching |
| `useAuth()` | `@chapelure/auth/composables/auth` | Current user, login, logout |
| `usePageActions()` | `@chapelure/common/composables/data/usePageActions` | CRUD page orchestration |
| `useEditModal()` | `@chapelure/common/composables/data/useEditModal` | Modal-based create/edit |
| `useValidationErrors()` | `@chapelure/common/utils/dev` | PocketBase form errors |

---

## i18n

Add a locale file under your feature folder — it will be auto-loaded:

```
src/features/my-feature/locales/fr.json
src/features/my-feature/locales/en.json
```

The glob pattern `@/features/**/locales/*.json` is resolved at build time by `i18n.ts`.
