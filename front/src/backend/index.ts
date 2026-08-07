/**
 * Backend wiring — the single place in the app that knows which backend it talks to.
 *
 * This is the seam. `@chapelure/pocketbase` must not be imported anywhere else in front/src;
 * everything downstream depends only on the `@chapelure/core` ports re-exported here.
 * Swapping backends means rewriting this file and pointing it at another adapter package.
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

/** Build a CRUD service for a collection, reading through to the server every time. */
export const crud: CrudFactory = <TEntity extends BaseEntity>(collection: string, relations?: string[]) =>
    createPocketBaseCrud<TEntity>(client, collection, relations);

/**
 * Same contract as `crud`, but the whole collection is fetched once and read from memory.
 * Only for small reference collections — call it at module scope so the cache is shared.
 */
export const cachedCrud: CrudFactory = <TEntity extends BaseEntity>(collection: string, relations?: string[]) =>
    createPocketBaseCached<TEntity>(client, collection, relations);

/** Resolves stored file references to URLs, so components never need the backend client. */
export const fileUrls: IFileUrlResolver = createPocketBaseFileUrls(client);

const auth = createPocketBaseAuth<BaseEntity>(client, Collections.Users);

/**
 * The auth provider, narrowed to the caller's user type.
 *
 * One instance is shared so the session is too; the cast is contained here because the
 * provider is created before any feature has declared what its user record looks like.
 */
export function authProvider<TUser extends BaseEntity>(): IAuthProvider<TUser> {
    return auth as unknown as IAuthProvider<TUser>;
}
