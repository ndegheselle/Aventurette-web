import PocketBase from 'pocketbase';
import { RememberingAuthStore } from './authStore';

let client: PocketBase | null = null;

/**
 * Connect once, from the app's composition root. Later calls return the first client. Its session
 * is kept by a `RememberingAuthStore`, which `createPocketBaseAuth` relies on.
 */
export function initPocketBase(url: string): PocketBase {
    client ??= new PocketBase(url, new RememberingAuthStore());
    return client;
}
