import { ValidationError } from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { createPocketBaseAuth } from './auth';
import { fakePocketBase } from './testing';

interface User { id: string; email: string }

const aRejection = (fields: Record<string, { code?: string }>) =>
    ({ status: 400, message: 'Failed', response: { data: fields } });

function setup(records: Record<string, unknown>[] = [{ id: 'usr1', email: 'parent@example.com' }]) {
    const pb = fakePocketBase(records);
    return { pb, auth: createPocketBaseAuth<User>(pb.client, 'users') };
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

    describe('register', () => {
        it('creates the account, asks for verification, then signs in', async () => {
            const { pb, auth } = setup([]);

            await auth.register('new@example.com', 'secret', 'secret');

            expect(pb.calls.map(c => c.method))
                .toEqual(['create', 'requestVerification', 'authWithPassword']);
        });

        it('passes the confirmation through, so the backend is what checks it', async () => {
            const { pb, auth } = setup([]);

            await auth.register('new@example.com', 'secret', 'different');

            expect(pb.lastCall('create')?.[0])
                .toEqual({ email: 'new@example.com', password: 'secret', passwordConfirm: 'different' });
        });

        it('normalises a rejected registration', async () => {
            const { pb, auth } = setup([]);
            pb.failNextWith(aRejection({ email: { code: 'validation_not_unique' } }));

            await expect(auth.register('taken@example.com', 'secret', 'secret'))
                .rejects.toBeInstanceOf(ValidationError);
        });

        it('does not sign in when the account could not be created', async () => {
            const { pb, auth } = setup([]);
            pb.failNextWith(aRejection({ email: { code: 'validation_not_unique' } }));

            await auth.register('taken@example.com', 'secret', 'secret').catch(() => { });

            expect(pb.calls.map(c => c.method)).toEqual(['create']);
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

    it('clears the stored session on logout', () => {
        const { pb, auth } = setup();

        auth.logout();

        expect(pb.calls.map(c => c.method)).toEqual(['authStore.clear']);
    });

    it('patches the user record on update', async () => {
        const { pb, auth } = setup();

        await auth.update('usr1', { email: 'changed@example.com' });

        expect(pb.lastCall('update')?.slice(0, 2)).toEqual(['usr1', { email: 'changed@example.com' }]);
    });
});
