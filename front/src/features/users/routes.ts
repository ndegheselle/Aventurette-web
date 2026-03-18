import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import { useAuth } from '@features/users/composables/auth';

import LoginPage from '@features/users/views/LoginPage.vue';
import RegisterPage from '@features/users/views/RegisterPage.vue';
import ProfilPage from '@features/users/views/profil/ProfilPage.vue';
import SelectProfilTypePage from '@features/users/views/profil/SelectProfilTypePage.vue';

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