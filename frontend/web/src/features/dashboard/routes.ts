import DashboardPage from '@features/dashboard/pages/Dashboard.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    dashboard: 'dashboard',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/dashboard',
        name: routesNames.dashboard,
        component: DashboardPage,
    },
];

export default routes;
