import { useAuth } from '@features/user/composables/useAuth';
import type { Role } from '@features/user/models/user';
import { routesNames } from '@features/user/routes';
import type { RouteLocationNormalized } from 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        /** Who may open the route: any one of these roles. Unset means any signed-in user. */
        roles?: readonly Role[];
    }
}

/**
 * Lets login through; anything else needs a session, or goes to login. A route whose
 * `meta.roles` the user does not hold sends them to the settings, open to anyone signed in: home
 * is an admin's screen, so sending them there would loop.
 */
export async function authGuard(to: RouteLocationNormalized) {
    if (to.name === routesNames.login)
        return;

    const auth = useAuth();
    if (!auth.isLoggedIn.value && !await auth.refresh())
        return { name: routesNames.login };

    if (!auth.hasRole(...to.meta.roles ?? []))
        return { name: routesNames.settings };
}
