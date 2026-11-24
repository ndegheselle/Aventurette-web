import LoginPage from '@features/user/ui/Login.page.vue';
import SettingsPage from '@features/user/ui/Settings.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    login: 'user.login',
    settings: 'user.settings',
} as const;

/** Reachable signed out, so it hangs under the bare layout. */
export const publicRoutes: RouteRecordRaw[] = [
    {
        path: '/user/login',
        name: routesNames.login,
        component: LoginPage,
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
