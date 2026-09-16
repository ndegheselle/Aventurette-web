import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { useAuth } from '@features/auth/composables/useAuth';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

/**
 * The registration form's state and what submitting it does. The confirmation is checked by the
 * backend, which answers `validation_values_mismatch` on `passwordConfirm` — rendered like any
 * other field error.
 *
 * XXX : pre-filled with a development account, same as the login form.
 */
export function useRegisterForm() {
    const auth = useAuth();
    const router = useRouter();

    const credentials = reactive({
        email: 'test@example.com',
        password: '1234567890',
        passwordConfirm: '1234567890',
    });

    const { isLoading, errors, submit } = useSubmit(async () => {
        await auth.register(credentials.email, credentials.password, credentials.passwordConfirm);
        router.push('/');
    });

    return { credentials, isLoading, errors, submit };
}
