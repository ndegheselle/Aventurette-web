import { users, type UserData } from '@features/users/data/users';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isLoggedIn = ref(false);
const user = ref<UserData | null>();
export const useAuth = () => {
    const router = useRouter();

    const login = async (email: string, password: string) => {
        user.value = await users.login(email, password);
        isLoggedIn.value = user.value != null;
    }

    const logout = async () => {
        await users.logout();
        user.value = null;
        isLoggedIn.value = user.value != null;
        router.push('/user/login');
    }

    const refresh = async () => {
        try {
            const me = await users.refresh(); // cookie is sent automatically
            user.value = me;
            isLoggedIn.value = true;
        } catch (err) {
            user.value = null;
            isLoggedIn.value = false;
        }
        return isLoggedIn.value;
    }

    return {
        isLoggedIn,
        user,
        login,
        logout,
        refresh
    };
}