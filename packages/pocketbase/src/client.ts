import PocketBase from 'pocketbase';

let client: PocketBase | null = null;

/**
 * Connect to a PocketBase instance. Idempotent — later calls return the first client.
 * The consuming app should do this once, from its composition root.
 */
export function initPocketBase(url: string): PocketBase {
    client ??= new PocketBase(url);
    return client;
}

export function getPocketBase(): PocketBase {
    if (!client)
        throw new Error('PocketBase is not initialised. Call initPocketBase(url) first.');
    return client;
}
