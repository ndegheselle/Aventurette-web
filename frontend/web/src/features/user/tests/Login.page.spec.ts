import { aUser, fakeAuthProvider, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '@features/user/ui/Login.page.vue';

const user = aUser({ email: 'parent@example.com' });
const auth = fakeAuthProvider(user);

// The auth feature reaches the backend through this one module. See tests/fakes.ts.
vi.mock('@features/user/api/session', () => ({
    sessionProvider: () => auth,
}));

async function mountForm() {
    const { wrapper, router } = await mountWithRouter(LoginPage, {
        // Start somewhere that is not the destination, so "went home" is a real assertion.
        initialRoute: '/login',
    });
    return { wrapper, router };
}

const input = (wrapper: any) => wrapper.find('input:not([type=checkbox])');
const button = (wrapper: any, label: string) => wrapper.findAll('button').find((b: any) => b.text().includes(label))!;

/** Fills the email step and asks for a code, leaving the form on the code step. */
async function requestCode(wrapper: any, email = 'someone@example.com') {
    await input(wrapper).setValue(email);
    await button(wrapper, 'Send me a code').trigger('click');
    await flushPromises();
}

async function submitCode(wrapper: any, code = '123456') {
    await input(wrapper).setValue(code);
    await button(wrapper, 'Log in').trigger('click');
    await flushPromises();
}

beforeEach(() => {
    auth.session = null;
});

describe('Login.page', () => {
    it('asks for an email only, with no password', async () => {
        const { wrapper } = await mountForm();

        expect(wrapper.text()).toContain('Email');
        expect(wrapper.text()).not.toContain('Password');
        expect(wrapper.find('input[type=password]').exists()).toBe(false);
    });

    it('asks for the code once it was sent, naming the email it went to', async () => {
        const { wrapper } = await mountForm();

        await requestCode(wrapper, 'someone@example.com');

        expect(wrapper.text()).toContain('A sign-in code was sent to someone@example.com');
        expect(wrapper.text()).toContain('Sign-in code');
    });

    it('stays on the email step when the code could not be sent', async () => {
        const { wrapper } = await mountForm();
        auth.failNextWith({ email: { code: 'validation_invalid_email' } });

        await requestCode(wrapper);

        expect(wrapper.text()).toContain('Invalid email, or already in use.');
        expect(wrapper.text()).not.toContain('Sign-in code');
    });

    it('signs in with the code and goes to the home page', async () => {
        const { wrapper, router } = await mountForm();
        await requestCode(wrapper);

        await submitCode(wrapper);

        expect(auth.session).toEqual(user);
        expect(router.currentRoute.value.path).toBe('/');
    });

    it('disables the button while the code is being checked', async () => {
        const { wrapper } = await mountForm();
        await requestCode(wrapper);

        await button(wrapper, 'Log in').trigger('click');
        expect(button(wrapper, 'Log in').attributes('disabled')).toBeDefined();

        await flushPromises();
        expect(button(wrapper, 'Log in').attributes('disabled')).toBeUndefined();
    });

    it('stays on the code step when the code is refused', async () => {
        const { wrapper, router } = await mountForm();
        await requestCode(wrapper);
        auth.failNextWith({});

        await submitCode(wrapper, '000000');

        expect(wrapper.text()).toContain('Invalid or expired code.');
        expect(router.currentRoute.value.path).toBe('/login');
        expect(auth.session).toBeNull();
    });

    it('can be retried after a refused code, with the error cleared', async () => {
        const { wrapper } = await mountForm();
        await requestCode(wrapper);
        auth.failNextWith({});
        await submitCode(wrapper, '000000');

        await submitCode(wrapper);

        expect(wrapper.text()).not.toContain('Invalid or expired code.');
        expect(auth.session).toEqual(user);
    });

    it('goes back to the email step to change it or get a new code', async () => {
        const { wrapper } = await mountForm();
        await requestCode(wrapper);

        await button(wrapper, 'Change email').trigger('click');

        expect(button(wrapper, 'Send me a code').exists()).toBe(true);
        expect(wrapper.text()).not.toContain('Sign-in code');
    });
});
