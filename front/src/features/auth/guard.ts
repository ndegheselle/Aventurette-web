import { useAuth } from '@features/auth/composables/useAuth';
import { routesNames } from '@features/auth/routes';
import type { RouteLocationNormalized } from 'vue-router';

/** Lets login and register through; anything else needs a session, or goes to login. */
export async function authGuard(to: RouteLocationNormalized) {
    if (to.name === routesNames.login || to.name === routesNames.register)
        return;

    const auth = useAuth();
    if (!auth.isLoggedIn.value && !await auth.refresh())
        return { name: routesNames.login };
}
