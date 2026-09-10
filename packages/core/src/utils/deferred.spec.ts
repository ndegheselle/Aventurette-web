import { describe, expect, it } from 'vitest';
import { Deferred } from './deferred';

describe('Deferred', () => {
    it('resolves from outside the promise', async () => {
        const deferred = new Deferred<string>();

        deferred.resolve('done');

        await expect(deferred.promise).resolves.toBe('done');
    });

    it('rejects from outside the promise', async () => {
        const deferred = new Deferred<string>();

        deferred.reject(new Error('nope'));

        await expect(deferred.promise).rejects.toThrow('nope');
    });

    it('exposes resolve synchronously, before anything awaits', () => {
        // This is the property useModal depends on: show() creates the Deferred and hands the
        // promise out, and confirm() resolves it much later from a click handler.
        const deferred = new Deferred();
        expect(typeof deferred.resolve).toBe('function');
    });
});
