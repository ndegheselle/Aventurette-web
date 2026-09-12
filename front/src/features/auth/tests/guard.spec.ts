import { aUser, fakeAuthProvider } from '@tests';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteLocationNormalized } from 'vue-router';
import { authGuard } from '@features/auth/guard';
import { routesNames } from '@features/auth/routes';

const provider = fakeAuthProvider(aUser());

vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => provider }));

const guard = authGuard(routesNames);

/** Only the guard's own inputs matter; the rest of a route location does not. */
const going = (name: string) => ({ name } as RouteLocationNormalized);

beforeEach(() => {
    provider.session = null;
});

describe('authGuard', () => {
    it('lets the login screen through, or nobody could ever sign in', async () => {
        await expect(guard(going(routesNames.login))).resolves.toBeUndefined();
    });

    it('lets the registration screen through', async () => {
        await expect(guard(going(routesNames.register))).resolves.toBeUndefined();
    });

    it('sends an anonymous visitor to the login screen', async () => {
        await expect(guard(going('activities'))).resolves.toEqual({ name: routesNames.login });
    });

    it('admits a visitor whose stored session is still valid', async () => {
        // The session survives a reload, so the guard asks the backend before turning anyone away.
        provider.session = aUser();

        await expect(guard(going('activities'))).resolves.toBeUndefined();
    });

    it('admits an already signed-in visitor without asking the backend again', async () => {
        provider.session = aUser();
        await guard(going('activities'));
        const refresh = vi.spyOn(provider, 'refresh');

        await guard(going('activities'));

        expect(refresh).not.toHaveBeenCalled();
        refresh.mockRestore();
    });
});
