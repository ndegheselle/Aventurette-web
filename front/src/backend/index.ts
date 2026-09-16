/**
 * The only file in the app that knows which backend it talks to. `@chapelure/pocketbase` may
 * not be imported anywhere else in front/src — everything downstream uses the ports built here.
 */
import { Collections } from '@/backend/schema.g';
import type { BaseEntity, CrudFactory, IAuthProvider, IFileUrlResolver } from '@chapelure/core';
import {
    createPocketBaseAuth,
    createPocketBaseCached,
    createPocketBaseCrud,
    createPocketBaseFileUrls,
    initPocketBase,
} from '@chapelure/pocketbase';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl)
    throw new Error('VITE_API_URL is not set — copy front/.env.example to front/.env.');

const client = initPocketBase(apiUrl);

/** A CRUD service for one collection, reading through to the server every time. */
export const crud: CrudFactory = <TEntity extends BaseEntity>(collection: string, relations?: string[]) =>
    createPocketBaseCrud<TEntity>(client, collection, relations);

/**
 * Same contract as `crud`, fetched once and read from memory. Only for small reference
 * collections, and only at module scope — the cache lives on the instance.
 */
export const cachedCrud: CrudFactory = <TEntity extends BaseEntity>(collection: string, relations?: string[]) =>
    createPocketBaseCached<TEntity>(client, collection, relations);

/** Resolves stored file references to urls. */
export const fileUrls: IFileUrlResolver = createPocketBaseFileUrls(client);

const auth = createPocketBaseAuth<BaseEntity>(client, Collections.Users);

/**
 * The auth provider, narrowed to the caller's user type. One instance, so the session is shared.
 */
export function authProvider<TUser extends BaseEntity>(): IAuthProvider<TUser> {
    return auth as unknown as IAuthProvider<TUser>;
}
