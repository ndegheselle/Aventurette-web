import PocketBase from 'pocketbase';
import { MemoryAuthStore, RememberingAuthStore } from './authStore';

let client: PocketBase | null = null;

export interface PocketBaseOptions {
    /**
     * Where the session is kept: the browser's storage, or memory only — for a process with no
     * browser, such as the MCP server, whose session ends with it.
     */
    session?: 'browser' | 'memory';
}

/**
 * Connect once, from the app's composition root. Later calls return the first client. Its store
 * has the `remember` flag that `createPocketBaseAuth` sets.
 */
export function initPocketBase(url: string, { session = 'browser' }: PocketBaseOptions = {}): PocketBase {
    client ??= new PocketBase(url, session === 'memory' ? new MemoryAuthStore() : new RememberingAuthStore());
    return client;
}
