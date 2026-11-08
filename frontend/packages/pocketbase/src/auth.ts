import type { BaseEntity, IAuthProvider, LoginOptions } from '@chapelure/core';
import type PocketBase from 'pocketbase';
import type { RememberingAuthStore } from './authStore';
import { mapErrors } from './errors';

/**
 * IAuthProvider backed by a PocketBase auth collection.
 *
 * @param fields the user fields the session holds, and the only ones asked for: the rest of the
 * record is read by whatever needs it, when it needs it.
 */
export function createPocketBaseAuth<TUser extends BaseEntity>(
    client: PocketBase,
    collectionName: string,
    fields: (keyof TUser & string)[],
): IAuthProvider<TUser> {
    const collection = client.collection(collectionName);
    // initPocketBase builds every client with this store.
    const store = client.authStore as RememberingAuthStore;
    // The SDK needs the token beside the record to keep the session.
    const options = { fields: ['token', ...fields.map(field => `record.${field}`)].join(',') };

    return {
        async login(email: string, password: string, { remember = true }: LoginOptions = {}): Promise<TUser> {
            // Before authenticating: the SDK saves the session as soon as it succeeds.
            store.remember = remember;
            const result = await mapErrors(() => collection.authWithPassword<TUser>(email, password, options));
            return result.record;
        },

        async requestOtp(email: string): Promise<string> {
            const result = await mapErrors(() => collection.requestOTP(email));
            return result.otpId;
        },

        async loginWithOtp(otpId: string, code: string, { remember = true }: LoginOptions = {}): Promise<TUser> {
            store.remember = remember;
            const result = await mapErrors(() => collection.authWithOTP<TUser>(otpId, code, options));
            return result.record;
        },

        async refresh(): Promise<TUser | null> {
            // A missing or expired session is expected here, not an error.
            try {
                const result = await collection.authRefresh<TUser>(options);
                return result.record ?? null;
            } catch {
                return null;
            }
        },

        logout(): void {
            store.clear();
        },
    };
}
