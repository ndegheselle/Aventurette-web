import { useAuth } from '@features/users/composables/auth';
import LoginPage from '@features/users/views/LoginPage.vue';
import UserProfilPage from '@features/users/views/UserProfilPage.vue';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

const userProfilRoute = 'userProfil';
const userLoginRoute = 'userLogin';

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
];

export async function usersBeforeEach(to: RouteLocationNormalized)
{
        if (to.name === userLoginRoute)
            return;
    
        const auth = useAuth();
        if (!auth.isLoggedIn.value && !await auth.refresh())
        {
            return { name: userLoginRoute };
        }
}

export { userLoginRoute, userProfilRoute };
export default routes;