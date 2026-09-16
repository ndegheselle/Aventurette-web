import type { RouteRecordRaw } from 'vue-router';

import ActivitiesEditPage from '@features/activities-authoring/pages/ActivitiesEdit.page.vue';
import ActivityEditPage from '@features/activities-authoring/pages/ActivityEdit.page.vue';

/**
 * Authoring has a path of its own rather than hanging off `/activities/:id`.
 *
 * `/activities` is somebody reading an activity; these two screens are somebody writing one,
 * and the list behind them is the author's own — which is also why the editor moved out of
 * `/activities/:id/edit`: it was never a view of that activity, it was the other half of this.
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
    },
    {
        path: '/activities/authoring/:id',
        name: routesNames.page,
        component: ActivityEditPage,
    },
];

export default routes;
