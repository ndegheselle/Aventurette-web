import { ValidationError } from '@chapelure/core';
import { withSetup } from '@tests';
import { describe, expect, it, vi } from 'vitest';
import { useSubmit } from './useSubmit';

function setup(action: () => Promise<void>, defaultErrorKey?: string) {
    const [submitter] = withSetup(() => useSubmit(action, { defaultErrorKey }));
    return submitter;
}

describe('useSubmit', () => {
    it('is idle before anything is submitted', () => {
        const form = setup(async () => { });

        expect(form.isLoading.value).toBe(false);
        expect(form.errors.global.value).toBeUndefined();
    });

    it('runs the action and reports success', async () => {
        const action = vi.fn(async () => { });
        const form = setup(action);

        await expect(form.submit()).resolves.toBe(true);
        expect(action).toHaveBeenCalledOnce();
    });

    it('is busy while the action runs', async () => {
        let release!: () => void;
        const form = setup(() => new Promise<void>(resolve => { release = resolve; }));

        const running = form.submit();
        expect(form.isLoading.value).toBe(true);

        release();
        await running;
        expect(form.isLoading.value).toBe(false);
    });

    it('reports a rejection as a failure instead of throwing', async () => {
        const form = setup(async () => { throw new ValidationError({ email: { code: 'validation_required' } }); });

        await expect(form.submit()).resolves.toBe(false);
        expect(form.errors.get('email')).toBe('This field is required.');
    });

    it('stops being busy after a failure, so the form can be retried', async () => {
        const form = setup(async () => { throw new Error('boom'); });

        await form.submit();

        expect(form.isLoading.value).toBe(false);
    });

    it('shows the caller\'s own message when the backend sent no field detail', async () => {
        const form = setup(async () => { throw new Error('boom'); }, 'users.login.defaultError');

        await form.submit();

        expect(form.errors.global.value).toBe('Wrong credentials.');
    });

    it('clears the previous failure when resubmitted', async () => {
        let fail = true;
        const form = setup(async () => {
            if (fail) throw new ValidationError({ email: { code: 'validation_required' } });
        });
        await form.submit();

        fail = false;
        await form.submit();

        expect(form.errors.get('email')).toBeUndefined();
        expect(form.errors.global.value).toBeUndefined();
    });
});
