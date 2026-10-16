import type { RouteRecordRaw } from 'vue-router';

import Activity from '@features/activities/ui/activity/activity.page.vue';
import Play from '@features/activities/ui/activity/play.page.vue';
import Library from '@features/activities/ui/library.page.vue';
import Search from '@features/activities/ui/search.page.vue';

export const routesNames = {
    library: 'activities.library',
    search: 'activities.search',
    activity: 'activities.activity',
    play: 'activities.play',
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
];

export default routes;
