import Default from '@/app/Default.layout.vue';
import activitiesRoutes, { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import activitiesEditRoutes from '@features/activities-authoring/routes';
import authRoutes from '@features/auth/routes';
import usersRoutes from '@features/users/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only picks the layout they hang under.
const routes: RouteRecordRaw[] = [
    {
        path: '',
        component: Default,
        children: [
            // XXX : until there is a dashboard to land on.
            { path: '', redirect: { name: activitiesRoutesNames.all } },
            ...authRoutes,
            ...usersRoutes,
            ...activitiesRoutes,
            ...activitiesEditRoutes,
        ]
    }
];

export default routes;
