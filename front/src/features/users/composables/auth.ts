import { NotAuthentifiedError } from '@common/utils/dev';
import { useProfil } from '@features/users/composables/profil';
import { users, type UserData } from '@features/users/data/users';
import { routesNames } from '@features/users/routes';
import { computed, readonly, ref } from 'vue';
import { useRouter } from 'vue-router';

// --- shared state (singleton) ---
const current = ref<UserData | null>(null);

export function useAuth() {
    const router = useRouter();
    const profil = useProfil();

    const isLoggedIn = computed(() => current.value !== null);

    async function update(data: Partial<UserData>) {
        if (!current.value) return;
        const updated = await users.update(current.value.id, data);
        current.value = updated;
    }

    async function register(email: string, password: string, passwordConfirm: string) {
        const user = await users.register(email, password, passwordConfirm);
        current.value = user;
        await profil.refresh(current.value);
    }

    async function login(email: string, password: string) {
        const user = await users.login(email, password);
        current.value = user;
        await profil.refresh(current.value);
    }

    async function logout() {
        await users.logout();
        current.value = null;
        profil.reset();
        router.push({ name: routesNames.login });
    }

    async function refresh() {
        console.log("refresg")
        try {
            const me = await users.refresh();
            current.value = me;
            await profil.refresh(current.value);
        } catch {
            current.value = null;
            profil.reset();
        }
        return isLoggedIn.value;
    }

    function currentId(): string {
        if (!current.value) {
            throw new NotAuthentifiedError();
        }
        return current.value.id;
    }

    return {
        // expose readonly state
        current: readonly(current),
        isLoggedIn,

        // actions
        login,
        register,
        logout,
        refresh,
        update,
        currentId,
    };
}