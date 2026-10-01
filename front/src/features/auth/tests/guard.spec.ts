import { aUser, fakeAuthProvider } from '@tests';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteLocationNormalized } from 'vue-router';
import { useAuth } from '@features/auth/composables/useAuth';
import { authGuard } from '@features/auth/guard';
import { Role } from '@features/auth/model/user';
import { routesNames } from '@features/auth/routes';

const provider = fakeAuthProvider(aUser());

vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => provider }));

/** Only the fields the guard reads; the rest of a route location does not matter. */
const going = (name: string, roles?: Role[]) => ({ name, meta: { roles } } as RouteLocationNormalized);

beforeEach(async () => {
    // The session is module state, so a user signed in by one test is still there in the next.
    await useAuth().logout();
    provider.session = null;
});

describe('authGuard', () => {
    it('lets the login screen through, or nobody could ever sign in', async () => {
        await expect(authGuard(going(routesNames.login))).resolves.toBeUndefined();
    });

    it('lets the registration screen through', async () => {
        await expect(authGuard(going(routesNames.register))).resolves.toBeUndefined();
    });

    it('sends an anonymous visitor to the login screen', async () => {
        await expect(authGuard(going('activities'))).resolves.toEqual({ name: routesNames.login });
    });

    it('admits a visitor whose stored session is still valid', async () => {
        // The session survives a reload, so the guard asks the backend before turning anyone away.
        provider.session = aUser();

        await expect(authGuard(going('activities'))).resolves.toBeUndefined();
    });

    it('admits an already signed-in visitor without asking the backend again', async () => {
        provider.session = aUser();
        await authGuard(going('activities'));
        const refresh = vi.spyOn(provider, 'refresh');

        await authGuard(going('activities'));

        expect(refresh).not.toHaveBeenCalled();
        refresh.mockRestore();
    });

    describe('a route restricted to some roles', () => {
        it('sends a user without the role home', async () => {
            provider.session = aUser({ role: Role.USER });

            await expect(authGuard(going('admin', [Role.ADMIN]))).resolves.toEqual({ path: '/' });
        });

        it('admits a user holding the role', async () => {
            provider.session = aUser({ role: Role.ADMIN });

            await expect(authGuard(going('admin', [Role.ADMIN]))).resolves.toBeUndefined();
        });

        it('still sends an anonymous visitor to login, not home', async () => {
            await expect(authGuard(going('admin', [Role.ADMIN]))).resolves.toEqual({ name: routesNames.login });
        });
    });
});
