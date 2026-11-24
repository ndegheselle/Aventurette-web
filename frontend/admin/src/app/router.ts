import Desktop from '@/app/layouts/Desktop.layout.vue';
import Empty from '@/app/layouts/Empty.layout.vue';
import authoringRoutes, { routesNames as authoringRoutesNames } from '@features/activities-authoring/routes';
import catalogueRoutes from '@features/catalogue-authoring/routes';
import userRoutes, { publicRoutes as userPublicRoutes } from '@features/user/routes';
import type { RouteRecordRaw } from 'vue-router';

// Each feature owns its route module; the app only picks the layout they hang under. The back
// office is laid out for a large screen, and keeps that layout whatever the width.
const routes: RouteRecordRaw[] = [
    { path: '', redirect: { name: authoringRoutesNames.all } },
    {
        path: '',
        component: Desktop,
        children: [
            ...authoringRoutes,
            ...catalogueRoutes,
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
