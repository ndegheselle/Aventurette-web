import Default from '@/app/layouts/Default.vue';
import type { RouteRecordRaw } from 'vue-router';

import HomePage from '@/pages/HomePage.vue';
import usersRoutes from '@features/users/routes';
import activiesRoutes from '@features/activities/routes';

const routes: RouteRecordRaw[] = [
    {
        path: '',
        component: Default,
        children: [
            {
                path: '',
                component: HomePage,
            },
            ...usersRoutes,
            ...activiesRoutes
        ]
    }
];

export default routes;