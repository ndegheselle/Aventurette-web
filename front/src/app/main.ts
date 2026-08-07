import './styles/index.css';

// Imported for its side effect: connects to the backend before any repository is used.
import '@/backend';

import { i18n } from '@/app/i18n';
import { authGuard } from '@features/auth/guard';
import { routesNames as authRoutesNames } from '@features/auth/routes';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';

const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach(authGuard(authRoutesNames));

createApp(App)
    .use(i18n)
    .use(router)
    .mount('#app');
