/**
 * The only file in the app that knows which backend it talks to. `@chapelure/pocketbase` may
 * not be imported anywhere else in front/src — everything downstream uses the ports built here.
 */
import { Collections } from '@/backend/schema.g';
import type { BaseEntity, CrudFactory, EntityMapper, IAuthProvider } from '@chapelure/core';
import {
    createPocketBaseAuth,
    createPocketBaseCrud,
    initPocketBase,
} from '@chapelure/pocketbase';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl)
    throw new Error('VITE_API_URL is not set — copy front/.env.example to front/.env.');

const client = initPocketBase(apiUrl);

/** A CRUD service for one collection, reading through to the server every time. */
export const crud: CrudFactory = <TPayload extends BaseEntity, TEntity extends BaseEntity>(
    collection: string,
    mapper: EntityMapper<TPayload, TEntity>,
) => createPocketBaseCrud<TPayload, TEntity>(client, collection, mapper);

const auth = createPocketBaseAuth<BaseEntity>(client, Collections.Users);

/**
 * The auth provider, narrowed to the caller's user type. One instance, so the session is shared.
 */
export function authProvider<TUser extends BaseEntity>(): IAuthProvider<TUser> {
    return auth as unknown as IAuthProvider<TUser>;
}
