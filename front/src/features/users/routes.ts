import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import { useAuth } from '@chapelure/auth/composables/useAuth';

import LoginPage from '@features/users/pages/LoginPage.vue';
import RegisterPage from '@features/users/pages/RegisterPage.vue';
import ProfilPage from '@features/users/pages/profil/ProfilPage.vue';
import SelectProfilTypePage from '@features/users/pages/profil/SelectProfilTypePage.vue';

export const routesNames = {
  profil: 'users.profil',
  profilType: 'users.profil.type',
  login: 'users.login',
  register: 'users.register',
} as const;

const routes: RouteRecordRaw[] = [
  {
    path: '/user/profil',
    name: routesNames.profil,
    component: ProfilPage,
  },
  {
    path: '/user/profil/type',
    name: routesNames.profilType,
    component: SelectProfilTypePage,
  },
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

export async function usersBeforeEach(to: RouteLocationNormalized) {
  if (to.name === routesNames.login || to.name === routesNames.register)
    return;

  const auth = useAuth();
  if (auth.isLoggedIn.value === false && (await auth.refresh()) === false) {
    return { name: routesNames.login };
  }
}

export default routes;