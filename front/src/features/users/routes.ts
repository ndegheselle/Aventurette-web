import { useAuth } from '@features/users/composables/auth';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import LoginPage from '@features/users/views/LoginPage.vue';
import RegisterPage from '@features/users/views/RegisterPage.vue';
import UserProfilPage from '@features/users/views/UserProfilPage.vue';

export const userProfilRoute = 'users.profil';
export const userLoginRoute = 'users.login';
export const userRegisterRoute = 'users.register';

const routes: RouteRecordRaw[] = [
    {
        path: '/user/profil',
        name: userProfilRoute,
        component: UserProfilPage,
    },
    {
        path: '/user/login',
        name: userLoginRoute,
        component: LoginPage,
    },
    {
        path: '/user/register',
        name: userRegisterRoute,
        component: RegisterPage,
    },
];

export async function usersBeforeEach(to: RouteLocationNormalized) {
    if (to.name === userLoginRoute || to.name === userRegisterRoute)
        return;

    const auth = useAuth();
    if (!auth.isLoggedIn.value && !await auth.refresh()) {
        return { name: userLoginRoute };
    }
}

export default routes;