import { aUser, fakeAuthProvider, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterForm from './RegisterForm.vue';

const user = aUser();
const auth = fakeAuthProvider(user);

vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => auth }));

async function mountForm() {
    return mountWithRouter(RegisterForm, {
        props: { loginRoute: 'login' },
        initialRoute: '/register',
    });
}

const submitButton = (wrapper: any) => wrapper.findAll('button').at(-1)!;

beforeEach(() => {
    auth.session = null;
});

describe('RegisterForm', () => {
    it('asks for the password twice', async () => {
        const { wrapper } = await mountForm();

        expect(wrapper.text()).toContain('Password');
        expect(wrapper.text()).toContain('Confirm password');
    });

    it('signs the new account in and goes to the home page', async () => {
        const { wrapper, router } = await mountForm();

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(auth.session).toEqual(user);
        expect(router.currentRoute.value.path).toBe('/');
    });

    it('edits the confirmation independently of the password', async () => {
        // These were bound to the same field once: typing a confirmation rewrote the password,
        // so the two could never disagree and the check was dead.
        const { wrapper } = await mountForm();
        const [password, confirmation] = wrapper.findAll('input[type="password"]');

        await confirmation!.setValue('different');

        expect((password!.element as HTMLInputElement).value).not.toBe('different');
    });

    it('shows a mismatch reported by the backend against the confirmation field', async () => {
        const { wrapper } = await mountForm();
        auth.failNextWith({ passwordConfirm: { code: 'validation_values_mismatch' } });

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('The values do not match.');
    });

    it('shows an email already in use against the email field', async () => {
        const { wrapper } = await mountForm();
        auth.failNextWith({ email: { code: 'validation_invalid_email' } });

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Invalid email, or already in use.');
        expect(wrapper.find('.input-error').exists()).toBe(true);
    });

    it('stays on the page when registration is refused', async () => {
        const { wrapper, router } = await mountForm();
        auth.failNextWith({});

        await submitButton(wrapper).trigger('click');
        await flushPromises();

        expect(router.currentRoute.value.path).toBe('/register');
    });

    it('offers a way back to the login screen', async () => {
        const { wrapper } = await mountForm();

        expect(wrapper.findAll('a').at(-1)!.text()).toContain('I already have an account');
    });
});
