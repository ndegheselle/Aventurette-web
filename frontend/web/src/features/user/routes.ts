import LoginPage from '@features/user/ui/Login.page.vue';
import OnboardingPage from '@features/user/ui/Onboarding.page.vue';
import ProfilePage from '@features/user/ui/Profile.page.vue';
import RegisterPage from '@features/user/ui/Register.page.vue';
import SettingsPage from '@features/user/ui/Settings.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    login: 'user.login',
    register: 'user.register',
    onboarding: 'user.onboarding',
    settings: 'user.settings',
    profile: 'user.profile',
} as const;

/** Reachable signed out, so they hang under the bare layout. */
export const publicRoutes: RouteRecordRaw[] = [
    {
        path: '/user/login',
        name: routesNames.login,
        component: LoginPage,
    },
    {
        path: '/user/register',
        name: routesNames.register,
        component: RegisterPage,
    },
];

/** Private, but under the bare layout all the same: nothing else of the app around them. */
export const bareRoutes: RouteRecordRaw[] = [
    {
        path: '/user/onboarding',
        name: routesNames.onboarding,
        component: OnboardingPage,
    },
];

const routes: RouteRecordRaw[] = [
    // The settings' sections are children: on a desktop they show beside the menu.
    {
        path: '/user/settings',
        name: routesNames.settings,
        component: SettingsPage,
        children: [
            {
                path: 'profile',
                name: routesNames.profile,
                component: ProfilePage,
            },
        ],
    },
];

export default routes;
