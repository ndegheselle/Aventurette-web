import HomePage from '@features/home/pages/Home.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    home: 'home',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '',
        name: routesNames.home,
        component: HomePage,
    },
];

export default routes;
