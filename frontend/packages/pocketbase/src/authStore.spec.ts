import { beforeEach, describe, expect, it } from 'vitest';
import { RememberingAuthStore } from './authStore';

const KEY = 'pocketbase_auth';
const record = { id: 'usr1', collectionId: 'users', collectionName: 'users' };

const stored = (storage: Storage) => storage.getItem(KEY);
const aSession = (token: string) => JSON.stringify({ token, record });

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

describe('RememberingAuthStore', () => {
    it('keeps a remembered session in localStorage only', () => {
        const store = new RememberingAuthStore();

        store.save('token', record);

        expect(stored(localStorage)).toContain('token');
        expect(stored(sessionStorage)).toBeNull();
    });

    it('keeps an unremembered session for the tab only, dropping a remembered one', () => {
        localStorage.setItem(KEY, aSession('old'));
        const store = new RememberingAuthStore();
        store.remember = false;

        store.save('token', record);

        expect(stored(sessionStorage)).toContain('token');
        expect(stored(localStorage)).toBeNull();
    });

    it('clears both storages on logout', () => {
        localStorage.setItem(KEY, aSession('a'));
        sessionStorage.setItem(KEY, aSession('b'));
        const store = new RememberingAuthStore();

        store.clear();

        expect(stored(localStorage)).toBeNull();
        expect(stored(sessionStorage)).toBeNull();
        expect(store.token).toBe('');
    });

    it('revives a tab session after a reload, and refreshes it into the tab again', () => {
        // A refreshed session that moved to localStorage would outlive the tab it was meant to end with.
        sessionStorage.setItem(KEY, aSession('tab'));

        const store = new RememberingAuthStore();
        expect(store.token).toBe('tab');

        store.save('refreshed', record);
        expect(stored(sessionStorage)).toContain('refreshed');
        expect(stored(localStorage)).toBeNull();
    });

    it('revives a remembered session as remembered', () => {
        localStorage.setItem(KEY, aSession('kept'));

        const store = new RememberingAuthStore();

        expect(store.token).toBe('kept');
        expect(store.remember).toBe(true);
    });

    it('treats an unreadable stored session as none', () => {
        localStorage.setItem(KEY, 'not json');

        const store = new RememberingAuthStore();

        expect(store.token).toBe('');
    });
});
