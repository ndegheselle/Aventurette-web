import type { RouteRecordRaw } from 'vue-router';

import ActivitiesPage from '@features/activities/pages/Activities.page.vue';
import ActivityPage from '@features/activities/pages/Activity.page.vue';
import ActivityPlayPage from '@features/activities/pages/ActivityPlay.page.vue';

export const routesNames = {
    page: 'activities.page',
    play: 'activities.play',
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
    },
    {
        path: '/activities/:id/play',
        name: routesNames.play,
        component: ActivityPlayPage,
    },
];

export default routes;
