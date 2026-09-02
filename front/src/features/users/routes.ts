import ProfilPage from '@features/users/pages/profil/Profil.page.vue';
import SelectProfilTypePage from '@features/users/pages/profil/SelectProfilType.page.vue';
import type { RouteRecordRaw } from 'vue-router';

export const routesNames = {
  profil: 'users.profil',
  profilType: 'users.profil.type',
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
];

export default routes;
