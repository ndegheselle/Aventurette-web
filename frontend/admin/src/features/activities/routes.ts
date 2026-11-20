import type { RouteRecordRaw } from 'vue-router';

import Activity from '@features/activities/ui/activity/activity.page.vue';
import Feedback from '@features/activities/ui/activity/feedback.page.vue';
import Play from '@features/activities/ui/activity/play.page.vue';
import Catalogue from '@features/activities/ui/library/catalogue.page.vue';
import Favorites from '@features/activities/ui/library/favorites.page.vue';

export const routesNames = {
    library: 'activities.library',
    favorites: 'activities.favorites',
    activity: 'activities.activity',
    play: 'activities.play',
    feedback: 'activities.feedback',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/activities/library',
        name: routesNames.library,
        component: Catalogue,
    },
    {
        path: '/activities/:id',
        name: routesNames.activity,
        component: Activity,
    },
    {
        path: '/activities/:id/play/:step?',
        name: routesNames.play,
        component: Play,
    },
    {
        path: '/activities/:id/feedback',
        name: routesNames.feedback,
        component: Feedback,
    },
];

/** The favorites, a tab of the user's space: the app mounts it there, so its path is relative to it. */
export const spaceRoutes: RouteRecordRaw[] = [
    {
        path: 'favorites',
        name: routesNames.favorites,
        component: Favorites,
    },
];

export default routes;
