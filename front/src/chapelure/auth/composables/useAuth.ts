import { usePocketBaseCrud } from '@chapelure/api/pocketbase';
import { NotAuthentifiedError, type BaseEntity } from '@chapelure/core';
import { routesNames } from '@features/users/routes';
import { Collections } from '@shared/types.g';
import { computed, readonly, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const current = ref<BaseEntity | null>(null);

export function useAuth<TUser extends BaseEntity>() {

    const crud = usePocketBaseCrud<TUser>(Collections.Users);
    const router = useRouter();
    const isLoggedIn = computed(() => current.value !== null);

    async function update(data: Partial<TUser>) {
        if (!current.value) return;
        const updated = await crud.update(current.value.id, data);
        current.value = updated;
    }

    async function register(email: string, password: string, passwordConfirm: string) {
        await crud.collection.create<TUser>({ email: email, password: password, passwordConfirm: passwordConfirm });
        await crud.collection.requestVerification(email);
        const result = await crud.collection.authWithPassword<TUser>(email, password);
        current.value = result?.record;
    }

    async function login(email: string, password: string) {
        const result = await crud.collection.authWithPassword<TUser>(email, password);
        current.value = result?.record;
    }

    async function logout() {
        crud.pb.authStore.clear();
        current.value = null;
        router.push({ name: routesNames.login });
    }

    async function refresh() {
        try {
            const result = await crud.collection.authRefresh<TUser>();
            current.value = result?.record;
        } catch {
            current.value = null;
        }
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
