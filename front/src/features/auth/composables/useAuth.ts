import { NotAuthentifiedError, type BaseEntity } from '@chapelure/core';
import { sessionProvider } from '@features/auth/api/session';
import { routesNames } from '@features/auth/routes';
import { computed, readonly, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

// Shared across every caller: one session per app.
const current = ref<BaseEntity | null>(null);

export function useAuth<TUser extends BaseEntity>() {

    const auth = sessionProvider<TUser>();
    const router = useRouter();
    const isLoggedIn = computed(() => current.value !== null);

    async function update(data: Partial<TUser>) {
        if (!current.value) return;
        current.value = await auth.update(current.value.id, data);
    }

    async function register(email: string, password: string, passwordConfirm: string) {
        current.value = await auth.register(email, password, passwordConfirm);
    }

    async function login(email: string, password: string) {
        current.value = await auth.login(email, password);
    }

    async function logout() {
        auth.logout();
        current.value = null;
        router.push({ name: routesNames.login });
    }

    async function refresh() {
        current.value = await auth.refresh();
        return isLoggedIn.value;
    }

    function currentId(): string {
        if (!current.value) throw new NotAuthentifiedError();
        return current.value.id;
    }

    return {
        current: readonly(current) as Readonly<Ref<TUser | null>>,
        isLoggedIn,
        login,
        register,
        logout,
        refresh,
        update,
        currentId,
    };
}
