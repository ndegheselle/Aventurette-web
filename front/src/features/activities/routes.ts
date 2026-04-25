import type { RouteRecordRaw } from 'vue-router';

import ActivitiesPage from '@features/activities/pages/ActivitiesPage.vue';
import ActivityPage from '@features/activities/pages/ActivityPage.vue';

export const routesNames = {
    page: 'activities.page',
    all: 'activities',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/activities',
        name: routesNames.all,
        component: ActivitiesPage,
    },
        {
        path: '/activities/:id',
        name: routesNames.page,
        component: ActivityPage,
    }
];

export default routes;