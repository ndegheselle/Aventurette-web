import { NotAuthentifiedError } from '@common/utils/dev';
import { useProfil } from '@features/users/composables/profil';
import { users, type UserData } from '@features/users/data/users';
import { routesNames } from '@features/users/routes';
import { computed, readonly, ref } from 'vue';
import { useRouter } from 'vue-router';

// --- shared state (singleton) ---
const currentUser = ref<UserData | null>(null);

export function useAuth() {
    const router = useRouter();
    const profil = useProfil();

    const isLoggedIn = computed(() => currentUser.value !== null);

    function setUser(user: UserData | null) {
        currentUser.value = user;

        if (user) {
            profil.refresh(user);
        } else {
            profil.reset();
        }
    }

    async function update(data: Partial<UserData>) {
        if (!currentUser.value) return;

        const updated = await users.update(currentUser.value.id, data);
        setUser(updated);
    }

    async function register(email: string, password: string, passwordConfirm: string) {
        const user = await users.register(email, password, passwordConfirm);
        setUser(user);
    }

    async function login(email: string, password: string) {
        const user = await users.login(email, password);
        setUser(user);
    }

    async function logout() {
        await users.logout();
        setUser(null);
        router.push({ name: routesNames.login });
    }

    async function refresh() {
        try {
            const me = await users.refresh();
            setUser(me);
        } catch {
            setUser(null);
        }
        return isLoggedIn.value;
    }

    function userId(): string {
        if (!currentUser.value) {
            throw new NotAuthentifiedError();
        }
        return currentUser.value.id;
    }

    return {
        // expose readonly state
        currentUser: readonly(currentUser),
        isLoggedIn,

        // actions
        login,
        register,
        logout,
        refresh,
        update,
        userId,
    };
}