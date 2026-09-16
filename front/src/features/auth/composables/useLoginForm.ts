import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { useAuth } from '@features/auth/composables/useAuth';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * The login form's state and what submitting it does.
 *
 * XXX : pre-filled with a development account. Has to go before real users see this.
 */
export function useLoginForm() {
    const auth = useAuth();
    const router = useRouter();

    const credentials = reactive({
        email: 'test@example.com',
        password: '1234567890',
    });

    // XXX : bound to the checkbox but sent nowhere — the provider decides the session's lifetime.
    const rememberMe = ref(true);

    const { isLoading, errors, submit } = useSubmit(
        async () => {
            await auth.login(credentials.email, credentials.password);
            router.push('/');
        },
        { defaultErrorKey: 'users.login.defaultError' },
    );

    return { credentials, rememberMe, isLoading, errors, submit };
}
