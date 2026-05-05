import './style.css';

import { initDatabase } from '@chapelure/api/pocketbase';
import { authGuard } from '@chapelure/auth/guard';
import { i18n } from '@chapelure/common/i18n';
import clickOutside from '@chapelure/common/utils/clickOustideDirective';
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
    .directive('click-outside', clickOutside)
    .mount('#app');