import type { RouteRecordRaw } from 'vue-router';

import Library from '@features/activities/pages/library.page.vue';
import Search from '@features/activities/pages/search.page.vue';

export const routesNames = {
    library: 'activities.library',
    search: 'activities.search',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/activities/library',
        name: routesNames.library,
        component: Library,
    },
    {
        path: '/activities/search',
        name: routesNames.search,
        component: Search,
    },
];

export default routes;
