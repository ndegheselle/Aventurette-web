import { NotAuthentifiedError } from '@chapelure/core';
import { aUser, createTestRouter, fakeAuthProvider, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserData } from '@features/users/model/user';
import { routesNames } from '@features/auth/routes';
import { useAuth } from './useAuth';

const user = aUser({ email: 'parent@example.com' });
const provider = fakeAuthProvider<UserData>(user);

vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => provider }));

async function setup() {
    const router = await createTestRouter({
        routes: [{ path: '/login', name: routesNames.login, component: { template: '<div/>' } }],
    });
    const [auth] = withSetup(() => useAuth<UserData>(), router);
    return { auth, router };
}

beforeEach(async () => {
    provider.session = null;
    // The session is module state shared by every caller — that is the point of it — so each
    // test has to put it back.
    const { auth } = await setup();
    if (auth.isLoggedIn.value) await auth.logout();
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

    it('drops the session and goes to the login screen on logout', async () => {
        const { auth, router } = await setup();
        await auth.login('parent@example.com', 'secret');

        await auth.logout();
        // logout() fires the navigation without awaiting it, so let it settle.
        await flushPromises();

        expect(auth.isLoggedIn.value).toBe(false);
        expect(provider.session).toBeNull();
        expect(router.currentRoute.value.name).toBe(routesNames.login);
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

    describe('update', () => {
        it('patches the signed-in user and keeps the new record', async () => {
            const { auth } = await setup();
            await auth.login('parent@example.com', 'secret');

            await auth.update({ type: 'SCHOOL' });

            expect(auth.current.value?.type).toBe('SCHOOL');
        });

        it('does nothing when no one is signed in', async () => {
            const { auth } = await setup();

            await auth.update({ type: 'SCHOOL' });

            expect(auth.current.value).toBeNull();
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

            expect(() => auth.currentId()).toThrow(NotAuthentifiedError);
        });
    });
});
