import { authProvider } from '@/backend';
import type { IAuthProvider } from '@chapelure/core';
import type { SessionUser } from '@features/user/models/user';

// A record rather than a list, so the compiler checks it names every field of SessionUser.
const SESSION_FIELDS: Record<keyof SessionUser, true> = {
    id: true,
    email: true,
    name: true,
    avatar: true,
    role: true,
    onboarded: true,
};

const provider = authProvider<SessionUser>(Object.keys(SESSION_FIELDS) as (keyof SessionUser)[]);

/** The auth feature's gateway to the backend, holding the session's fields of the user only. */
export function sessionProvider(): IAuthProvider<SessionUser> {
    return provider;
}
