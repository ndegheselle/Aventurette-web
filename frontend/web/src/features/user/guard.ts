import { useAuth } from '@features/user/composables/useAuth';
import { needsOnboarding, type Role } from '@features/user/models/user';
import { routesNames } from '@features/user/routes';
import type { RouteLocationNormalized } from 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        /** Who may open the route: any one of these roles. Unset means any signed-in user. */
        roles?: readonly Role[];
    }
}

/**
 * Lets login and register through; anything else needs a session, or goes to login. A user who
 * has not seen the onboarding goes there first. A route whose `meta.roles` the user does not hold
 * sends them home.
 */
export async function authGuard(to: RouteLocationNormalized) {
    if (to.name === routesNames.login || to.name === routesNames.register)
        return;

    const auth = useAuth();
    if (!auth.isLoggedIn.value && !await auth.refresh())
        return { name: routesNames.login };

    if (to.name !== routesNames.onboarding && needsOnboarding(auth.current.value))
        return { name: routesNames.onboarding };

    if (!auth.hasRole(...to.meta.roles ?? []))
        return { path: '/' };
}
