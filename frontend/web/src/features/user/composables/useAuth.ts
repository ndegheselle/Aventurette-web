import { NotAuthenticatedError } from '@chapelure/core';
import { sessionProvider } from '@features/user/api/session';
import { hasRole as userHasRole, type Role, type SessionUser } from '@features/user/models/user';
import { computed, readonly, ref } from 'vue';

// Module state: one session, shared by every caller.
const current = ref<SessionUser | null>(null);

export function useAuth() {

    const auth = sessionProvider();
    const isLoggedIn = computed(() => current.value !== null);

    async function register(email: string, password: string, passwordConfirm: string) {
        current.value = await auth.register(email, password, passwordConfirm);
    }

    async function login(email: string, password: string) {
        current.value = await auth.login(email, password);
    }

    /** Drop the session. Where to go next is the caller's. */
    function logout() {
        auth.logout();
        current.value = null;
    }

    async function refresh() {
        current.value = await auth.refresh();
        return isLoggedIn.value;
    }

    /** Whether the signed-in user holds one of `roles`. Reactive in a template, as it reads the session. */
    function hasRole(...roles: Role[]): boolean {
        return userHasRole(current.value, roles);
    }

    function currentId(): string {
        if (!current.value) throw new NotAuthenticatedError();
        return current.value.id;
    }

    return {
        current: readonly(current),
        isLoggedIn,
        login,
        register,
        logout,
        refresh,
        currentId,
        hasRole,
    };
}
