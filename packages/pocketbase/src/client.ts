import PocketBase from 'pocketbase';

let client: PocketBase | null = null;

/** Connect once, from the app's composition root. Later calls return the first client. */
export function initPocketBase(url: string): PocketBase {
    client ??= new PocketBase(url);
    return client;
}
