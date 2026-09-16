import { describe, expect, it, vi } from 'vitest';
import { useModal, type IModalController } from './useModal';

describe('useModal', () => {
    it('is hidden until shown', () => {
        expect(useModal().isShown.value).toBe(false);
    });

    it('resolves the promise from show() with what confirm() was given', async () => {
        const modal = useModal<string>();

        const answer = modal.show();
        modal.confirm('picked');

        await expect(answer).resolves.toBe('picked');
        expect(modal.isShown.value).toBe(false);
    });

    it('resolves with null on cancel, so callers can tell the two apart', async () => {
        const modal = useModal<string>();

        const answer = modal.show();
        modal.cancel();

        await expect(answer).resolves.toBeNull();
    });

    it('defaults a bare confirm() to true, for a modal that only asks yes or no', async () => {
        const modal = useModal();

        const answer = modal.show();
        modal.confirm(null);

        await expect(answer).resolves.toBe(true);
    });

    it('runs onShow before it becomes visible, so the form is seeded first', () => {
        const seen: boolean[] = [];
        const modal: IModalController = useModal({ onShow: () => { seen.push(modal.isShown.value); } });

        modal.show();

        expect(seen).toEqual([false]);
    });

    it('calls onCancel when cancelled', () => {
        const onCancel = vi.fn();
        const modal = useModal({ onCancel });

        modal.show();
        modal.cancel();

        expect(onCancel).toHaveBeenCalledOnce();
    });

    it('lets onConfirm veto by returning false, leaving the promise pending', async () => {
        // How a form keeps a modal open on a validation failure.
        const modal = useModal<string>({ onConfirm: () => false });
        const settled = vi.fn();

        modal.show().then(settled);
        modal.confirm('ignored');
        await Promise.resolve();

        expect(settled).not.toHaveBeenCalled();
    });

    it('KNOWN DEVIATION: a vetoed confirm still hides the modal', () => {
        // IModalOptions says onConfirm returning false "prevents the modal from being closed
        // and the promise from being resolved". Only the second half holds: confirm() sets
        // isShown before consulting onConfirm, so the dialog closes over a pending promise.
        //
        // Nothing calls the veto today, which is why this has never been visible. The fix is to
        // move the `isShown.value = false` below the onConfirm check. Left as-is deliberately:
        // this pass changes no behaviour. Flip this test when the fix lands.
        const modal = useModal<string>({ onConfirm: () => false });

        modal.show();
        modal.confirm('ignored');

        expect(modal.isShown.value).toBe(false);
    });

    it('still resolves after a veto once a later confirm is allowed', async () => {
        let allow = false;
        const modal = useModal<string>({ onConfirm: () => allow });

        const answer = modal.show();
        modal.confirm('first');
        allow = true;
        modal.confirm('second');

        await expect(answer).resolves.toBe('second');
    });

    it('gives each show() its own promise', async () => {
        const modal = useModal<string>();

        const first = modal.show();
        modal.confirm('one');
        const second = modal.show();
        modal.confirm('two');

        await expect(first).resolves.toBe('one');
        await expect(second).resolves.toBe('two');
    });

    it('ignores a confirm with no modal open', () => {
        const modal = useModal<string>();

        expect(() => modal.confirm('stray')).not.toThrow();
    });
});
