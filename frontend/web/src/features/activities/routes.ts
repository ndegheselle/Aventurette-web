import type { RouteRecordRaw } from 'vue-router';

import Activity from '@features/activities/ui/activity/activity.page.vue';
import Play from '@features/activities/ui/activity/play.page.vue';
import Catalogue from '@features/activities/ui/library/catalogue.page.vue';
import Favorites from '@features/activities/ui/library/favorites.page.vue';
import Library from '@features/activities/ui/library/library.page.vue';
import Search from '@features/activities/ui/search.page.vue';

export const routesNames = {
    library: 'activities.library',
    favorites: 'activities.favorites',
    search: 'activities.search',
    activity: 'activities.activity',
    play: 'activities.play',
} as const;

const routes: RouteRecordRaw[] = [
    // The tabs are children of the library, so a link to the library stays active on any tab.
    {
        path: '/activities/library',
        component: Library,
        children: [
            {
                path: '',
                name: routesNames.library,
                component: Catalogue,
            },
            {
                path: 'favorites',
                name: routesNames.favorites,
                component: Favorites,
            },
        ],
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
