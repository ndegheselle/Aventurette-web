import { authProvider } from '@/backend';
import type { BaseEntity, IAuthProvider } from '@chapelure/core';

/**
 * The auth feature's gateway to the backend, narrowed to the caller's user type.
 *
 * Exists so that `@/backend` is only ever imported from a feature's data/ folder, the same
 * rule every other feature follows.
 */
export function sessionProvider<TUser extends BaseEntity>(): IAuthProvider<TUser> {
    return authProvider<TUser>();
}
