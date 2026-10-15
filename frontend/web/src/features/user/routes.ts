import LoginPage from '@features/user/ui/Login.page.vue';
import RegisterPage from '@features/user/ui/Register.page.vue';
import SettingsPage from '@features/user/ui/Settings.page.vue';
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
