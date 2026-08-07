import './style.css';

// Imported for its side effect: connects to the backend before any repository is used.
import '@/backend';

import { i18n } from '@chapelure/common/i18n';
import clickOutside from '@chapelure/common/utils/clickOustideDirective';
import { authGuard } from '@features/auth/guard';
import { routesNames } from '@features/users/routes';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './routes';

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