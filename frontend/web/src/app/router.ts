import Desktop from '@/app/layouts/Desktop.layout.vue';
import Empty from '@/app/layouts/Empty.layout.vue';
import Responsive from '@/app/layouts/Responsive.layout.vue';
import activitiesRoutes, { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import authoringRoutes from '@features/admin/activities-authoring/routes';
import catalogueRoutes from '@features/admin/catalogue-authoring/routes';
import dashboardRoutes from '@features/dashboard/routes';
import planningRoutes from '@features/planning/routes';
import userRoutes, { bareRoutes as userBareRoutes, publicRoutes as userPublicRoutes } from '@features/user/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only picks the layout they hang under.
const routes: RouteRecordRaw[] = [
    // XXX : until the dashboard has something to show.
    { path: '', redirect: { name: activitiesRoutesNames.library } },
    {
        path: '',
        component: Responsive,
        children: [

            ...dashboardRoutes,
            ...activitiesRoutes,
            ...planningRoutes,
            ...userRoutes,
        ]
    },
    // Authoring is laid out for a large screen: only the desktop sidebar links it, and it keeps
    // that layout whatever the width. Who may open it is the routes' own `meta.roles`.
    {
        path: '',
        component: Desktop,
        children: [
            ...authoringRoutes,
            ...catalogueRoutes,
        ]
    },
    {
        path: '',
        component: Empty,
        children: [
            ...userPublicRoutes,
            ...userBareRoutes,
        ]
    },
];

export default routes;
