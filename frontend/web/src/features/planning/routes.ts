import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    planning: 'planning',
} as const;

// The planning is the first tab of the user's space: the app mounts it there, and the empty path
// makes it that space's own address, so a link to it stays active on the other tabs.
const routes: RouteRecordRaw[] = [
    {
        path: '',
        name: routesNames.planning,
        // Loaded when opened: FullCalendar alone would add a third to the main bundle.
        component: () => import('@features/planning/ui/Planning.page.vue'),
    },
];

export default routes;
