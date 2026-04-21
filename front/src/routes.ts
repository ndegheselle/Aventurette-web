import Default from '@/layouts/Default.vue';
import type { RouteRecordRaw } from 'vue-router';

import HomePage from '@/pages/HomePage.vue';
import usersRoutes from '@features/users/routes';

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
        ]
    }
];

export default routes;