import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { useAuth } from '@features/user/composables/useAuth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * The login form, in two steps: the email, to which a one-time code is sent, then that code.
 * Each step has its own submission, so an error on one never shows on the other.
 *
 * XXX : pre-filled with a development account. Has to go before real users see this.
 */
export function useLoginForm() {
    const auth = useAuth();
    const router = useRouter();

    const email = ref('test@example.com');
    const code = ref('');
    // Set once a code was sent: it is what the code is checked against.
    const otpId = ref<string | null>(null);
    const codeSent = computed(() => otpId.value !== null);

    // XXX : bound to the checkbox but sent nowhere — the provider decides the session's lifetime.
    const rememberMe = ref(true);

    const codeRequest = useSubmit(
        async () => {
            otpId.value = await auth.requestOtp(email.value);
        },
        { defaultErrorKey: 'auth.login.requestError' },
    );

    const codeLogin = useSubmit(
        async () => {
            if (!otpId.value) return;
            await auth.loginWithOtp(otpId.value, code.value);
            router.push('/');
        },
        { defaultErrorKey: 'auth.login.codeError' },
    );

    /** Back to the email step, to correct it or have a new code sent. */
    function changeEmail() {
        otpId.value = null;
        code.value = '';
        codeLogin.errors.reset();
    }

    return {
        email,
        code,
        codeSent,
        rememberMe,
        requestCode: codeRequest.submit,
        isRequestingCode: codeRequest.isLoading,
        requestErrors: codeRequest.errors,
        login: codeLogin.submit,
        isLoggingIn: codeLogin.isLoading,
        loginErrors: codeLogin.errors,
        changeEmail,
    };
}
