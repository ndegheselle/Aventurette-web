import LoginPage from '@features/user/pages/Login.page.vue';
import RegisterPage from '@features/user/pages/Register.page.vue';
import SettingsPage from '@features/user/pages/Settings.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    login: 'user.login',
    register: 'user.register',
    settings: 'user.settings',
} as const;

/** Reachable signed out, so they hang under the bare layout. */
export const publicRoutes: RouteRecordRaw[] = [
    {
        path: '/user/login',
        name: routesNames.login,
        component: LoginPage,
    },
    {
        path: '/user/register',
        name: routesNames.register,
        component: RegisterPage,
    },
];

const routes: RouteRecordRaw[] = [
    {
        path: '/user/settings',
        name: routesNames.settings,
        component: SettingsPage,
    },
];

export default routes;
