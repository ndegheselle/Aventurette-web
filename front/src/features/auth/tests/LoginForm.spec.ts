import { aUser, fakeAuthProvider, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from '@features/auth/components/LoginForm.vue';

const user = aUser({ email: 'parent@example.com' });
const auth = fakeAuthProvider(user);

// The auth feature reaches the backend through this one module. See tests/fakes.ts.
vi.mock('@features/auth/api/session', () => ({
    sessionProvider: () => auth,
}));

async function mountForm() {
    const { wrapper, router } = await mountWithRouter(LoginForm, {
        props: { registerRoute: 'register' },
        // Start somewhere that is not the destination, so "went home" is a real assertion.
        initialRoute: '/login',
    });
    return { wrapper, router };
}

const emailInput = (wrapper: any) => wrapper.findAll('input')[0]!;
const submitButton = (wrapper: any) => wrapper.findAll('button').at(-1)!;

beforeEach(() => {
    auth.session = null;
});

describe('LoginForm', () => {
    it('shows the fields a login needs', async () => {
        const { wrapper } = await mountForm();

        expect(wrapper.text()).toContain('Email');
        expect(wrapper.text()).toContain('Password');
        expect(submitButton(wrapper).text()).toContain('Log in');
    });

    it('signs in with what was typed and goes to the home page', async () => {
        const { wrapper, router } = await mountForm();
        await emailInput(wrapper).setValue('someone@example.com');

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(auth.session).toEqual(user);
        expect(router.currentRoute.value.path).toBe('/');
    });

    it('disables the button while the request is in flight', async () => {
        const { wrapper } = await mountForm();

        await submitButton(wrapper).trigger('click');
        expect(submitButton(wrapper).attributes('disabled')).toBeDefined();

        await flushPromises();
        expect(submitButton(wrapper).attributes('disabled')).toBeUndefined();
    });

    it('shows the field error the backend sent back', async () => {
        const { wrapper } = await mountForm();
        auth.failNextWith({ email: { code: 'validation_invalid_email' } });

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Invalid email, or already in use.');
    });

    it('says the credentials were wrong when the backend gave no detail', async () => {
        const { wrapper } = await mountForm();
        auth.failNextWith({});

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Wrong credentials.');
    });

    it('stays on the page when the login is refused', async () => {
        const { wrapper, router } = await mountForm();
        auth.failNextWith({});

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(router.currentRoute.value.path).toBe('/login');
        expect(auth.session).toBeNull();
    });

    it('can be retried after a refusal, with the error cleared', async () => {
        const { wrapper } = await mountForm();
        auth.failNextWith({});
        await submitButton(wrapper).trigger('click');
        await flushPromises();

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(wrapper.text()).not.toContain('Wrong credentials.');
        expect(auth.session).toEqual(user);
    });

    it('offers a way to the registration screen', async () => {
        const { wrapper } = await mountForm();

        const link = wrapper.findAll('a').at(-1)!;
        expect(link.text()).toContain('Create a new account');
    });
});
