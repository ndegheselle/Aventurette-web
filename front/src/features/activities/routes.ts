import type { RouteRecordRaw } from 'vue-router';

import ActivitiesPage from '@features/activities/pages/Activities.page.vue';
import ActivityPage from '@features/activities/pages/Activity.page.vue';

import EditLayout from '@features/activities/pages/edit/_layout.vue';
import DescriptionEdit from '@features/activities/pages/edit/DescriptionEdit.page.vue';
import StepsEdit from '@features/activities/pages/edit/StepsEdit.page.vue';
import PropertiesEdit from '@features/activities/pages/edit/PropertiesEdit.page.vue';

export const routesNames = {
    page: 'activities.page',
    all: 'activities',
    edit : {
        description: "activities.edit.description",
        steps: "activities.edit.steps",
        properties: "activities.edit.properties",
    }
} as const;

const routes: RouteRecordRaw[] = [
    {
        path: '/activities',
        name: routesNames.all,
        component: ActivitiesPage,
    },
        {
        path: '/activities/:id',
        name: routesNames.page,
        component: ActivityPage,
    },
        {
        path: '/activities/:id/edit',
        component: EditLayout,
        children: [
            {
                path: '/activities/:id/description',
                name: routesNames.edit.description,
                component: DescriptionEdit
            },
            {
                path: '/activities/:id/steps',
                name: routesNames.edit.steps,
                component: StepsEdit
            },
            {
                path: '/activities/:id/properties',
                name: routesNames.edit.properties,
                component: PropertiesEdit
            }
        ]
    }
];

export default routes;