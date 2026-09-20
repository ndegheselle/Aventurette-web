import type { RouteRecordRaw } from 'vue-router';

import CataloguePage from '@features/admin/pages/Catalogue.page.vue';

export const routesNames = {
    catalogue: 'admin.catalogue',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/admin/catalogue',
        name: routesNames.catalogue,
        component: CataloguePage,
    },
];

export default routes;
