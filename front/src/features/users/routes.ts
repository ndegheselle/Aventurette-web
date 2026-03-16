import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import LoginPage from '@features/users/views/LoginPage.vue';
import RegisterPage from '@features/users/views/RegisterPage.vue';
import UserProfilPage from '@features/users/views/UserProfilPage.vue';
import SelectProfilTypePage from '@features/users/views/profil/SelectProfilTypePage.vue';

import ChildrensPage from '@features/users/views/family/ChildrensPage.vue';
import { useAuth } from '@features/users/composables/auth';
import { useProfil } from '@features/users/composables/profil';

export const userProfilRoute = 'users.profil';
export const userLoginRoute = 'users.login';

export const userRegisterRoute = 'users.register';
export const userProfilTypeRoute = 'users.profil.type';
export const userFamilyChildrensRoute = 'users.family.childrens';

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
        path: '/user/family/childrens',
        name: userFamilyChildrensRoute,
        component: ChildrensPage,
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

    // Check if logged in
    const auth = useAuth();
    if (!auth.isLoggedIn.value && !await auth.refresh()) {
        return { name: userLoginRoute };
    }

    // Check if user have a valid profil (linked to auth user)
    const profil = useProfil();
    if (profil.withValidProfil)
        return { name: userProfilTypeRoute };

    
}

export default routes;