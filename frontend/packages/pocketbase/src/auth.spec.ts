import { ValidationError } from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { createPocketBaseAuth } from './auth';
import { fakePocketBase } from './testing';

interface User { id: string; email: string }

const aRejection = (fields: Record<string, { code?: string }>) =>
    ({ status: 400, message: 'Failed', response: { data: fields } });

function setup(records: Record<string, unknown>[] = [{ id: 'usr1', email: 'parent@example.com' }]) {
    const pb = fakePocketBase(records);
    return { pb, auth: createPocketBaseAuth<User>(pb.client, 'users', ['id', 'email']) };
}

describe('createPocketBaseAuth', () => {
    describe('login', () => {
        it('returns the user record, not the SDK\'s auth envelope', async () => {
            const { auth } = setup();

            await expect(auth.login('parent@example.com', 'secret'))
                .resolves.toEqual({ id: 'usr1', email: 'parent@example.com' });
        });

        it('normalises rejected credentials into a ValidationError', async () => {
            const { pb, auth } = setup();
            pb.failNextWith(aRejection({ identity: { code: 'validation_invalid_login' } }));

            await expect(auth.login('parent@example.com', 'wrong')).rejects.toBeInstanceOf(ValidationError);
        });
    });

    describe('refresh', () => {
        it('revives a session the backend still accepts', async () => {
            const { auth } = setup();

            await expect(auth.refresh()).resolves.toEqual({ id: 'usr1', email: 'parent@example.com' });
        });

        it('answers null rather than throwing when there is no session', async () => {
            // A missing or expired session is the expected case on a cold load, not an error.
            const { pb, auth } = setup();
            pb.failNextWith(aRejection({}));

            await expect(auth.refresh()).resolves.toBeNull();
        });

        it('answers null for a network failure too, so boot is never blocked by one', async () => {
            const { pb, auth } = setup();
            pb.failNextWith(new Error('Failed to fetch'));

            await expect(auth.refresh()).resolves.toBeNull();
        });
    });

    it('asks for the session\'s fields of the user only, beside the token', async () => {
        const { pb, auth } = setup();

        await auth.login('parent@example.com', 'secret');
        await auth.loginWithOtp('otp1', '123456');
        await auth.refresh();

        const asked = { fields: 'token,record.id,record.email' };
        expect(pb.lastCall('authWithPassword')?.[2]).toEqual(asked);
        expect(pb.lastCall('authWithOTP')?.[2]).toEqual(asked);
        expect(pb.lastCall('authRefresh')?.[0]).toEqual(asked);
    });

    describe('remembering the session', () => {
        const remembered = (pb: { client: { authStore: unknown } }) =>
            (pb.client.authStore as { remember: boolean }).remember;

        it('remembers a code login unless told otherwise', async () => {
            const { pb, auth } = setup();

            await auth.loginWithOtp('otp1', '123456');

            expect(remembered(pb)).toBe(true);
        });

        it('keeps a code login for the tab only when not to be remembered', async () => {
            const { pb, auth } = setup();

            await auth.loginWithOtp('otp1', '123456', { remember: false });

            expect(remembered(pb)).toBe(false);
        });
    });

    it('clears the stored session on logout', () => {
        const { pb, auth } = setup();

        auth.logout();

        expect(pb.calls.map(c => c.method)).toEqual(['authStore.clear']);
    });
});
