import Default from '@/layouts/Default.vue';
import type { RouteRecordRaw } from 'vue-router';

import HomePage from '@/views/HomePage.vue';
import authRoutes from '@features/users/routes';

const routes: RouteRecordRaw[] = [
    {
        path: '',
        component: Default,
        children: [
            {
                path: '',
                component: HomePage,
            },
            ...authRoutes,
        ]
    }
];

export default routes;