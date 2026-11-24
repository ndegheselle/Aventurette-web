import { UnverifiedAccountError } from '@chapelure/core';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { useAuth } from '@features/user/composables/useAuth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * The login form, in two steps: the email, to which a one-time code is sent, then that code. The
 * first step also takes a password, to sign in without a mailbox. Each submission has its own
 * errors, so an error on one never shows on another.
 *
 * XXX : pre-filled with a development account. Has to go before real users see this.
 */
export function useLoginForm() {
    const auth = useAuth();
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const code = ref('');
    // Set once a code was sent: it is what the code is checked against.
    const otpId = ref<string | null>(null);
    const codeSent = computed(() => otpId.value !== null);
    // The code was sent because a password sign-in found the email not verified: the code step
    // says so, since the user asked for no code.
    const unverified = ref(false);

    // Unticked, the session ends with the tab.
    const rememberMe = ref(true);

    const codeRequest = useSubmit(
        async () => {
            unverified.value = false;
            otpId.value = await auth.requestOtp(email.value);
        },
        { defaultErrorKey: 'auth.login.requestError' },
    );

    const codeLogin = useSubmit(
        async () => {
            if (!otpId.value) return;
            await auth.loginWithOtp(otpId.value, code.value, rememberMe.value);
            router.push('/');
        },
        { defaultErrorKey: 'auth.login.codeError' },
    );

    /**
     * The right password to an account whose email was never verified sends the code that
     * verifies it instead: the form moves on to the code step, or shows why the code was not sent.
     */
    const passwordLogin = useSubmit(
        async () => {
            try {
                await auth.loginWithPassword(email.value, password.value, rememberMe.value);
            } catch (error) {
                if (!(error instanceof UnverifiedAccountError)) throw error;
                unverified.value = await codeRequest.submit();
                return;
            }
            router.push('/');
        },
        { defaultErrorKey: 'auth.login.passwordError' },
    );

    // A busy form takes no second press, whichever button started it.
    const isBusy = computed(() =>
        codeRequest.isLoading.value || codeLogin.isLoading.value || passwordLogin.isLoading.value);

    /** Back to the email step, to correct it or have a new code sent. */
    function changeEmail() {
        otpId.value = null;
        unverified.value = false;
        code.value = '';
        codeLogin.errors.reset();
    }

    return {
        email,
        password,
        code,
        codeSent,
        unverified,
        rememberMe,
        isBusy,
        requestCode: codeRequest.submit,
        requestErrors: codeRequest.errors,
        loginWithPassword: passwordLogin.submit,
        passwordErrors: passwordLogin.errors,
        login: codeLogin.submit,
        loginErrors: codeLogin.errors,
        changeEmail,
    };
}
