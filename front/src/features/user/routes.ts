import SettingsPage from '@features/user/pages/Settings.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    settings: 'user.settings',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/user/settings',
        name: routesNames.settings,
        component: SettingsPage,
    },
];

export default routes;
