/**
 * The only file in the app that knows which backend it talks to. `@chapelure/pocketbase` may
 * not be imported anywhere else in frontend/web/src — everything downstream uses the ports built here.
 */
import { Collections } from '@/backend/schema.g';
import type { BaseEntity, BatchFactory, CrudFactory, EntityMapper, IAuthProvider, IdFactory } from '@chapelure/core';
import {
    createPocketBaseAuth,
    createPocketBaseBatch,
    createPocketBaseCrud,
    initPocketBase,
    pocketBaseId,
} from '@chapelure/pocketbase';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl)
    throw new Error('VITE_API_URL is not set — copy frontend/web/.env.example to frontend/web/.env.');

const client = initPocketBase(apiUrl);

/** A CRUD service for one collection, reading through to the server every time. */
export const crud: CrudFactory = <TPayload extends BaseEntity, TEntity extends BaseEntity>(
    collection: string,
    mapper: EntityMapper<TPayload, TEntity>,
) => createPocketBaseCrud<TPayload, TEntity>(client, collection, mapper);

/** Writes over several collections, sent as one transaction. A fresh batch on every call. */
export const batch: BatchFactory = () => createPocketBaseBatch(client);

/** An id for a record that a batch creates, so the rest of the batch can point at it. */
export const newId: IdFactory = pocketBaseId;

/**
 * The auth provider, narrowed to the caller's user type. The session holds `fields` of the user
 * and nothing more. Every provider shares the client's one session.
 */
export function authProvider<TUser extends BaseEntity>(fields: (keyof TUser & string)[]): IAuthProvider<TUser> {
    return createPocketBaseAuth<TUser>(client, Collections.Users, fields);
}
