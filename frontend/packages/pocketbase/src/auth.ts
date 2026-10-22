import type { BaseEntity, IAuthProvider } from '@chapelure/core';
import type PocketBase from 'pocketbase';
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
    // The SDK needs the token beside the record to keep the session.
    const options = { fields: ['token', ...fields.map(field => `record.${field}`)].join(',') };

    return {
        async login(email: string, password: string): Promise<TUser> {
            const result = await mapErrors(() => collection.authWithPassword<TUser>(email, password, options));
            return result.record;
        },

        async register(email: string, password: string, passwordConfirm: string): Promise<TUser> {
            return await mapErrors(async () => {
                await collection.create({ email, password, passwordConfirm });
                await collection.requestVerification(email);
                const result = await collection.authWithPassword<TUser>(email, password, options);
                return result.record;
            });
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
            client.authStore.clear();
        },
    };
}
