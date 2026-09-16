import { afterEach, describe, expect, it, vi } from 'vitest';
import { TriangleAlertIcon } from 'lucide-vue-next';
import { useConfirmation } from './useConfirmation';
import { useModal } from './useModal';

/** The composable holds one registration for the whole app; put it back after each test. */
afterEach(() => {
    useConfirmation().registerModal(null as any);
});

describe('useConfirmation', () => {
    it('declines, rather than throwing, when no dialog is mounted', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Null reads as "cancelled", so a missing dialog declines instead of throwing.
        await expect(useConfirmation().show('Remove?', 'Are you sure?')).resolves.toBeNull();
        expect(error).toHaveBeenCalled();

        error.mockRestore();
    });

    it('shows the registered dialog and carries the prompt into it', async () => {
        const confirmation = useConfirmation();
        const controller = useModal();
        confirmation.registerModal(controller);

        confirmation.show('Remove?', 'Are you sure?', TriangleAlertIcon);

        expect(controller.isShown.value).toBe(true);
        expect(confirmation.title.value).toBe('Remove?');
        expect(confirmation.message.value).toBe('Are you sure?');
        expect(confirmation.icon.value).toBe(TriangleAlertIcon);
    });

    it('clears the icon when a later prompt does not want one', () => {
        const confirmation = useConfirmation();
        confirmation.registerModal(useModal());
        confirmation.show('First', 'With icon', TriangleAlertIcon);

        confirmation.show('Second', 'Without');

        expect(confirmation.icon.value).toBeNull();
    });

    it('resolves true when confirmed', async () => {
        const confirmation = useConfirmation();
        confirmation.registerModal(useModal());

        const answer = confirmation.show('Remove?', 'Are you sure?');
        confirmation.confirm();

        await expect(answer).resolves.toBe(true);
    });

    it('resolves null when cancelled, which callers read as declined', async () => {
        const confirmation = useConfirmation();
        confirmation.registerModal(useModal());

        const answer = confirmation.show('Remove?', 'Are you sure?');
        confirmation.cancel();

        await expect(answer).resolves.toBeNull();
    });

    it('is one dialog shared by the whole app', () => {
        const controller = useModal();
        useConfirmation().registerModal(controller);

        useConfirmation().show('From elsewhere', 'Anywhere');

        expect(controller.isShown.value).toBe(true);
    });
});
