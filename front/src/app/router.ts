import Auth from '@/app/Auth.layout.vue';
import Default from '@/app/Default.layout.vue';
import activitiesRoutes, { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import authoringRoutes from '@features/activities-authoring/routes';
import authRoutes from '@features/auth/routes';
import dashboardRoutes from '@features/dashboard/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only picks the layout they hang under.
const routes: RouteRecordRaw[] = [
    // XXX : until the dashboard has something to show.
    { path: '', redirect: { name: activitiesRoutesNames.all } },
    {
        path: '',
        component: Default,
        children: [

            ...dashboardRoutes,
            ...activitiesRoutes,
            ...authoringRoutes,
        ]
    },
    {
        path: '',
        component: Auth,
        children: [
            ...authRoutes,
        ]
    },
];

export default routes;
