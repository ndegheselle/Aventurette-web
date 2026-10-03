import { describe, expect, it } from 'vitest';
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

    it('runs onShow before it becomes visible, so the form is seeded first', () => {
        const seen: boolean[] = [];
        const modal: IModalController = useModal({ onShow: () => { seen.push(modal.isShown.value); } });

        modal.show();

        expect(seen).toEqual([false]);
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
