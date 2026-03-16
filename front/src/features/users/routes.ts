import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import LoginPage from '@features/users/views/LoginPage.vue';
import RegisterPage from '@features/users/views/RegisterPage.vue';
import UserProfilPage from '@features/users/views/UserProfilPage.vue';
import FamilyUpdatePage from '@features/users/views/profil/FamilyUpdatePage.vue';
import SelectProfilTypePage from '@features/users/views/profil/SelectProfilTypePage.vue';

export const userProfilRoute = 'users.profil';
export const userLoginRoute = 'users.login';

export const userRegisterRoute = 'users.register';
export const userProfilTypeRoute = 'users.profil.type';
export const userProfilFamilyRoute = 'users.profil.family';

const routes: RouteRecordRaw[] = [
    {
        path: '/user/profil',
        name: userProfilRoute,
        component: UserProfilPage,
    },
    {
        path: '/user/profil/type',
        name: userProfilTypeRoute,
        component: SelectProfilTypePage,
    },
    {
        path: '/user/profil/family',
        name: userProfilFamilyRoute,
        component: FamilyUpdatePage,
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
    /*
    if (to.name === userLoginRoute || to.name === userRegisterRoute)
        return;

    const auth = useAuth();
    if (!auth.isLoggedIn.value && !await auth.refresh()) {
        return { name: userLoginRoute };
    }*/
}

export default routes;