import './styles/index.css';

// Side effect: connects to the backend before any api module is used.
import '@/backend';

import { i18n } from '@/app/i18n';
import { authGuard } from '@features/auth/guard';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';

const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach(authGuard);

createApp(App)
    .use(i18n)
    .use(router)
    .mount('#app');
