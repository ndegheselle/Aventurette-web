import Default from '@/app/Default.layout.vue';
import activitiesRoutes, { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import authRoutes from '@features/auth/routes';
import usersRoutes from '@features/users/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only decides the layout they hang under.
const routes: RouteRecordRaw[] = [
    {
        path: '',
        component: Default,
        children: [
            // For now redirect homeRoutes (will add a dashboard later)
            { path: '', redirect: { name: activitiesRoutesNames.all } },
            ...authRoutes,
            ...usersRoutes,
            ...activitiesRoutes,
        ]
    }
];

export default routes;
