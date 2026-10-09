import Empty from '@/app/layouts/Empty.layout.vue';
import Mobile from '@/app/layouts/Mobile.layout.vue';
import activitiesRoutes, { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import authoringRoutes from '@features/admin/activities-authoring/routes';
import catalogueRoutes from '@features/admin/catalogue-authoring/routes';
import authRoutes from '@features/auth/routes';
import dashboardRoutes from '@features/dashboard/routes';
import userRoutes from '@features/user/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only picks the layout they hang under.
const routes: RouteRecordRaw[] = [
    // XXX : until the dashboard has something to show.
    { path: '', redirect: { name: activitiesRoutesNames.all } },
    {
        path: '',
        component: Mobile,
        children: [

            ...dashboardRoutes,
            ...activitiesRoutes,
            ...authoringRoutes,
            ...catalogueRoutes,
            ...userRoutes,
        ]
    },
    {
        path: '',
        component: Empty,
        children: [
            ...authRoutes,
        ]
    },
];

export default routes;
