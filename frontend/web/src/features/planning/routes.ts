import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    planning: 'planning',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/planning',
        name: routesNames.planning,
        // Loaded when opened: FullCalendar alone would add a third to the main bundle.
        component: () => import('@features/planning/ui/Planning.page.vue'),
    },
];

export default routes;
