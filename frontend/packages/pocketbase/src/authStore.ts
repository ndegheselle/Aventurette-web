import { BaseAuthStore, type AuthRecord } from 'pocketbase';

const STORAGE_KEY = 'pocketbase_auth';

interface StoredSession {
    token: string;
    record: AuthRecord;
}

/**
 * The SDK's auth store, kept in `localStorage` when the user asked to be remembered and in
 * `sessionStorage` otherwise, so an unremembered session ends with the tab.
 *
 * `remember` is read on every save, so it is set before authenticating. A session found at
 * startup keeps the storage it was found in: the refresh that follows saves it back there.
 */
export class RememberingAuthStore extends BaseAuthStore {
    remember = true;

    constructor() {
        super();

        const remembered = read(localStorage);
        const forTheTab = read(sessionStorage);
        const found = remembered ?? forTheTab;
        if (found) {
            this.remember = remembered !== null;
            super.save(found.token, found.record);
        }

        // Another tab logging in or out changes the remembered session; follow it, as the SDK's
        // own store does. A tab's session is its own, so there is nothing to follow there.
        window.addEventListener('storage', event => {
            if (event.key !== STORAGE_KEY || event.storageArea !== localStorage) return;
            const changed = read(localStorage);
            super.save(changed?.token ?? '', changed?.record ?? null);
        });
    }

    override save(token: string, record?: AuthRecord): void {
        const kept = this.remember ? localStorage : sessionStorage;
        const other = this.remember ? sessionStorage : localStorage;
        const session: StoredSession = { token, record: record ?? null };

        kept.setItem(STORAGE_KEY, JSON.stringify(session));
        other.removeItem(STORAGE_KEY);
        super.save(token, record);
    }

    override clear(): void {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        super.clear();
    }
}

function read(storage: Storage): StoredSession | null {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as StoredSession;
    } catch {
        // Unreadable, so as good as absent: the user signs in again.
        return null;
    }
}
