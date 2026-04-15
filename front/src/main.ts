import './style.css';

import { initDatabase } from '@api/pocketbase';
import { i18n } from '@common/i18n';
import { applyDefaultBehaviors } from '@common/utils/dom';
import { usersBeforeEach } from '@features/users/routes';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './routes';

initDatabase(import.meta.env.VITE_API_URL);

const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach(usersBeforeEach);

createApp(App)
.use(i18n)
.use(router)
.mount('#app');

applyDefaultBehaviors();