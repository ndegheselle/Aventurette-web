import { NotAuthenticatedError } from '@chapelure/core';
import { aUser, fakeAuthProvider, withSetup } from '@tests';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserData } from '@features/auth/model/user';
import { useAuth } from '@features/auth/composables/useAuth';

const user = aUser({ email: 'parent@example.com' });
const provider = fakeAuthProvider<UserData>(user);

vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => provider }));

async function setup() {
    const [auth] = withSetup(() => useAuth());
    return { auth };
}

beforeEach(async () => {
    provider.session = null;
    // The session is module state shared by every caller, so each test has to put it back.
    const { auth } = await setup();
    if (auth.isLoggedIn.value) auth.logout();
});

describe('useAuth', () => {
    it('starts signed out', async () => {
        const { auth } = await setup();

        expect(auth.isLoggedIn.value).toBe(false);
        expect(auth.current.value).toBeNull();
    });

    it('holds the user after a login', async () => {
        const { auth } = await setup();

        await auth.login('parent@example.com', 'secret');

        expect(auth.isLoggedIn.value).toBe(true);
        expect(auth.current.value).toEqual(user);
    });

    it('holds the user after a registration', async () => {
        const { auth } = await setup();

        await auth.register('parent@example.com', 'secret', 'secret');

        expect(auth.current.value).toEqual(user);
    });

    it('lets a rejected login through to the caller rather than swallowing it', async () => {
        const { auth } = await setup();
        provider.failNextWith({});

        await expect(auth.login('parent@example.com', 'wrong')).rejects.toThrow();
        expect(auth.isLoggedIn.value).toBe(false);
    });

    it('shares one session across every caller', async () => {
        const { auth } = await setup();
        await auth.login('parent@example.com', 'secret');

        const { auth: elsewhere } = await setup();

        expect(elsewhere.isLoggedIn.value).toBe(true);
    });

    it('drops the session on logout', async () => {
        const { auth } = await setup();
        await auth.login('parent@example.com', 'secret');

        auth.logout();

        expect(auth.isLoggedIn.value).toBe(false);
        expect(provider.session).toBeNull();
    });

    describe('refresh', () => {
        it('revives a session the backend still recognises', async () => {
            provider.session = user;
            const { auth } = await setup();

            await expect(auth.refresh()).resolves.toBe(true);
            expect(auth.current.value).toEqual(user);
        });

        it('reports no session when there is none to revive', async () => {
            const { auth } = await setup();

            await expect(auth.refresh()).resolves.toBe(false);
        });
    });

    describe('currentId', () => {
        it('returns the signed-in user\'s id', async () => {
            const { auth } = await setup();
            await auth.login('parent@example.com', 'secret');

            expect(auth.currentId()).toBe(user.id);
        });

        it('throws rather than returning an empty id when signed out', async () => {
            const { auth } = await setup();

            expect(() => auth.currentId()).toThrow(NotAuthenticatedError);
        });
    });
});
