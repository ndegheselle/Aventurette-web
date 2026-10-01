import { Role } from '@features/auth/model/user';
import type { RouteRecordRaw } from 'vue-router';

import ActivitiesEditPage from '@features/admin/activities-authoring/pages/ActivitiesEdit.page.vue';
import ActivityEditPage from '@features/admin/activities-authoring/pages/ActivityEdit.page.vue';

/**
 * Authoring has a path of its own: `/activities` is somebody reading an activity, these two
 * screens are somebody writing one.
 */
export const routesNames = {
    all: 'activities.authoring',
    page: 'activities.authoring.page',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/activities/authoring',
        name: routesNames.all,
        component: ActivitiesEditPage,
        meta: { roles: [Role.ADMIN] },
    },
    {
        path: '/activities/authoring/:id',
        name: routesNames.page,
        component: ActivityEditPage,
        meta: { roles: [Role.ADMIN] },
    },
];

export default routes;
