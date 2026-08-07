import type { BaseEntity, IAuthProvider } from '@chapelure/core';
import type PocketBase from 'pocketbase';
import { mapErrors } from './errors';

/**
 * IAuthProvider backed by a PocketBase auth collection.
 *
 * Everything PocketBase-specific about sessions — authWithPassword, authRefresh, the authStore,
 * the verification email — is contained here, so the UI only ever sees the port.
 */
export function createPocketBaseAuth<TUser extends BaseEntity>(
    client: PocketBase,
    collectionName: string
): IAuthProvider<TUser> {
    const collection = client.collection(collectionName);

    return {
        async login(email: string, password: string): Promise<TUser> {
            const result = await mapErrors(() => collection.authWithPassword<TUser>(email, password));
            return result.record;
        },

        async register(email: string, password: string, passwordConfirm: string): Promise<TUser> {
            return await mapErrors(async () => {
                await collection.create({ email, password, passwordConfirm });
                await collection.requestVerification(email);
                const result = await collection.authWithPassword<TUser>(email, password);
                return result.record;
            });
        },

        async refresh(): Promise<TUser | null> {
            // A missing or expired session is an expected outcome here, not an error.
            try {
                const result = await collection.authRefresh<TUser>();
                return result.record ?? null;
            } catch {
                return null;
            }
        },

        logout(): void {
            client.authStore.clear();
        },

        async update(id: string, data: Partial<TUser>): Promise<TUser> {
            return await mapErrors(() => collection.update<TUser>(id, data));
        },
    };
}
