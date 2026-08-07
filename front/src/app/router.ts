import Default from '@/app/layouts/Default.vue';
import activitiesRoutes from '@features/activities/routes';
import authRoutes from '@features/auth/routes';
import homeRoutes from '@features/home/routes';
import usersRoutes from '@features/users/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only decides the layout they hang under.
const routes: RouteRecordRaw[] = [
    {
        path: '',
        component: Default,
        children: [
            ...homeRoutes,
            ...authRoutes,
            ...usersRoutes,
            ...activitiesRoutes,
        ]
    }
];

export default routes;
