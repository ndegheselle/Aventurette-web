import { authProvider } from '@/backend';
import type { IAuthProvider } from '@chapelure/core';
import type { UserData } from '@features/auth/model/user';

/** The auth feature's gateway to the backend, typed with this app's user record. */
export function sessionProvider(): IAuthProvider<UserData> {
    return authProvider<UserData>();
}
