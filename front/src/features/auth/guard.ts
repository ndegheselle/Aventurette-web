import type { RouteLocationNormalized } from "vue-router";
import { useAuth } from "./composables/useAuth";

export function authGuard(routesNames: { login: string, register: string }) {
    return async function usersBeforeEach(to: RouteLocationNormalized) {
        if (to.name === routesNames.login || to.name === routesNames.register)
            return;

        const auth = useAuth();
        if (auth.isLoggedIn.value === false && (await auth.refresh()) === false) {
            return { name: routesNames.login };
        }
    };
}