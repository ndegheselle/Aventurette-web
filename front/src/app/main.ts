import './styles/index.css';

// Side effect: connects to the backend before any api module is used.
import '@/backend';

import { i18n } from '@/app/i18n';
import { applyStoredTheme } from '@chapelure/ui/settings/useSettings';
import { authGuard } from '@features/auth/guard';
import { createVaporApp, vaporInteropPlugin } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';

const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach(authGuard);

applyStoredTheme();

// Vapor app; the interop plugin lets it render the VDOM components it uses
// (vue-router's RouterView, lucide icons, tiptap's EditorContent).
createVaporApp(App)
    .use(vaporInteropPlugin)
    .use(i18n)
    .use(router)
    .mount('#app');
