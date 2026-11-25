import { Role } from '@features/user/models/user';
import type { RouteRecordRaw } from 'vue-router';

import ActivitiesEditPage from '@features/activities-authoring/ui/ActivitiesEdit.page.vue';
import ActivitiesImportPage from '@features/activities-authoring/ui/ActivitiesImport.page.vue';
import ActivityEditPage from '@features/activities-authoring/ui/ActivityEdit.page.vue';

/**
 * Authoring has a path of its own: `/activities` is somebody reading an activity, these
 * screens are somebody writing one, by hand or from an import.
 */
export const routesNames = {
    all: 'activities.authoring',
    new: 'activities.authoring.new',
    import: 'activities.authoring.import',
    page: 'activities.authoring.page',
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/activities/authoring',
        name: routesNames.all,
        component: ActivitiesEditPage,
        meta: { roles: [Role.ADMIN] },
    },
    // The editor on an activity that does not exist yet: its first save creates it. A static
    // segment outranks `:id`, so `new` is never read as an id.
    {
        path: '/activities/authoring/new',
        name: routesNames.new,
        component: ActivityEditPage,
        meta: { roles: [Role.ADMIN] },
    },
    {
        path: '/activities/authoring/import',
        name: routesNames.import,
        component: ActivitiesImportPage,
        meta: { roles: [Role.ADMIN] },
    },
    {
        path: '/activities/authoring/:id',
        name: routesNames.page,
        component: ActivityEditPage,
        meta: { roles: [Role.ADMIN] },
    },
];

export default routes;
