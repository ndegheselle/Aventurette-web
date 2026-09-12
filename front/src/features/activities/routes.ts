import type { RouteRecordRaw } from 'vue-router';

import ActivitiesPage from '@features/activities/pages/Activities.page.vue';
import ActivityPage from '@features/activities/pages/Activity.page.vue';
import ActivityEditPage from '@features/activities/pages/ActivityEdit.page.vue';

export const routesNames = {
    page: 'activities.page',
    all: 'activities',
    edit: 'activities.edit',
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
        path: '/activities/:id/edit',
        name: routesNames.edit,
        component: ActivityEditPage,
    }
];

export default routes;
