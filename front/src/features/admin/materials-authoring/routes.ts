import type { RouteRecordRaw } from 'vue-router';

import MaterialsEditPage from '@features/admin/materials-authoring/pages/MaterialsEdit.page.vue';

/**
 * The catalogue has one screen, beside the activities' authoring: the materials every activity
 * picks from, named and renamed here.
 */
export const routesNames = {
    all: 'materials.authoring',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/materials/authoring',
        name: routesNames.all,
        component: MaterialsEditPage,
    },
];

export default routes;
