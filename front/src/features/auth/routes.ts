import LoginPage from '@features/auth/pages/Login.page.vue';
import RegisterPage from '@features/auth/pages/Register.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
    login: 'auth.login',
    register: 'auth.register',
} as const;

const routes: RouteRecordRaw[] = [
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

export default routes;
