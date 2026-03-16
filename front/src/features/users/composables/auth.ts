import { useProfil } from '@features/users/composables/profil';
import { users, type UserData } from '@features/users/data/users';
import { userLoginRoute } from '@features/users/routes';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isLoggedIn = ref(false);
const user = ref<UserData | null>();
export const useAuth = () => {
    const router = useRouter();
    const profil = useProfil();

    function setUser(u: UserData | null)
    {
        if (u == null)
            profil.reset();
        else if (u)
            profil.refresh(u);

        user.value = u;
        isLoggedIn.value = user.value != null;
    }

    const update = async(data: Partial<UserData>) : Promise<void> => {
        if (!user.value) return;
        let updated = await users.update(user.value?.id, data);
        setUser(updated);
    };

    const register = async (email: string, password: string, passwordConfirm: string) => {
        let newUser = await users.register(email, password, passwordConfirm);
        setUser(newUser);
    }

    const login = async (email: string, password: string) => {
        var logged = await users.login(email, password);
        setUser(logged);
    }

    const logout = async () => {
        await users.logout();
        setUser(null);
        router.push({name: userLoginRoute});
    }

    const refresh = async () => {
        try {
            const me = await users.refresh(); // cookie is sent automatically
            setUser(me);
        } catch (err) {
            setUser(null);
        }
        return isLoggedIn.value;
    }

    return {
        isLoggedIn,
        user,
        login,
        register,
        logout,
        refresh,
        update
    };
}