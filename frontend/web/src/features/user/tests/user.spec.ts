import { aUser } from '@tests';
import { describe, expect, it } from 'vitest';
import { hasRole, Role, roleOf, withFavoriteToggled, type UserData } from '@features/user/models/user';

describe('roleOf', () => {
    it('reads an empty role as a plain user', () => {
        // What the backend stores for an account nobody granted a role.
        expect(roleOf(aUser({ role: '' as UserData['role'] }))).toBe(Role.USER);
    });
});

describe('hasRole', () => {
    it('lets anyone through when no role is asked for, signed out included', () => {
        expect(hasRole(null)).toBe(true);
    });

    it('refuses a signed-out visitor once a role is asked for', () => {
        expect(hasRole(null, [Role.USER])).toBe(false);
    });

    it('admits a user holding any one of the roles', () => {
        expect(hasRole(aUser({ role: Role.ADMIN }), [Role.USER, Role.ADMIN])).toBe(true);
    });

    it('refuses a user holding none of them', () => {
        expect(hasRole(aUser({ role: Role.USER }), [Role.ADMIN])).toBe(false);
    });
});

describe('withFavoriteToggled', () => {
    it('adds an activity that is not a favourite yet', () => {
        expect(withFavoriteToggled(['act-1'], 'act-2')).toEqual(['act-1', 'act-2']);
    });

    it('takes off an activity that is one already, keeping the others', () => {
        expect(withFavoriteToggled(['act-1', 'act-2'], 'act-1')).toEqual(['act-2']);
    });
});
