import PocketBase from 'pocketbase';
import { RememberingAuthStore } from './authStore';

let client: PocketBase | null = null;

/**
 * Connect once, from the app's composition root. Later calls return the first client. Its store
 * has the `remember` flag that `createPocketBaseAuth` sets.
 */
export function initPocketBase(url: string): PocketBase {
    client ??= new PocketBase(url, new RememberingAuthStore());
    return client;
}
