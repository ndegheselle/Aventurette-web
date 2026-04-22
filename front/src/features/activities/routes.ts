import type { RouteRecordRaw } from 'vue-router';

import ActivitiesPage from '@features/activities/pages/ActivitiesPage.vue';

export const routesNames = {
  all: 'activities.all',
} as const;

const routes: RouteRecordRaw[] = [
  {
    path: '/activities',
    name: routesNames.all,
    component: ActivitiesPage,
  }
];

export default routes;