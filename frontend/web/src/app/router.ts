import Empty from '@/app/layouts/Empty.layout.vue';
import Responsive from '@/app/layouts/Responsive.layout.vue';
import activitiesRoutes, { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import dashboardRoutes from '@features/dashboard/routes';
import userRoutes, { publicRoutes as userPublicRoutes } from '@features/user/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only picks the layout they hang under.
// XXX : features/admin/ is set aside — not routed, typechecked or tested — until it is brought
// back in line with activities. See tsconfig.json and vitest.config.ts.
const routes: RouteRecordRaw[] = [
    // XXX : until the dashboard has something to show.
    { path: '', redirect: { name: activitiesRoutesNames.library } },
    {
        path: '',
        component: Responsive,
        children: [

            ...dashboardRoutes,
            ...activitiesRoutes,
            ...userRoutes,
        ]
    },
    {
        path: '',
        component: Empty,
        children: [
            ...userPublicRoutes,
        ]
    },
];

export default routes;
