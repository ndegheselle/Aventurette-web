import { Role } from '@features/auth/model/user';
import type { RouteRecordRaw } from 'vue-router';

import CataloguePage from '@features/admin/catalogue-authoring/pages/Catalogue.page.vue';
import MaterialsCataloguePage from '@features/admin/catalogue-authoring/pages/MaterialsCatalogue.page.vue';
import SafetyCataloguePage from '@features/admin/catalogue-authoring/pages/SafetyCatalogue.page.vue';
import TagsCataloguePage from '@features/admin/catalogue-authoring/pages/TagsCatalogue.page.vue';
import TipsCataloguePage from '@features/admin/catalogue-authoring/pages/TipsCatalogue.page.vue';

/**
 * The catalogues every activity picks from, one tab each under one screen, beside the
 * activities' authoring.
 */
export const routesNames = {
    materials: 'catalogue.materials',
    tags: 'catalogue.tags',
    safety: 'catalogue.safety',
    tips: 'catalogue.tips',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/catalogue',
        component: CataloguePage,
        // The children inherit it: vue-router merges `meta` down the matched routes.
        meta: { roles: [Role.ADMIN] },
        redirect: { name: routesNames.materials },
        children: [
            { path: 'materials', name: routesNames.materials, component: MaterialsCataloguePage },
            { path: 'tags', name: routesNames.tags, component: TagsCataloguePage },
            { path: 'safety', name: routesNames.safety, component: SafetyCataloguePage },
            { path: 'tips', name: routesNames.tips, component: TipsCataloguePage },
        ],
    },
];

export default routes;
