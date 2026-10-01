import type { FieldErrors } from '@chapelure/core';
import { withSetup } from '@tests';
import { describe, expect, it, vi } from 'vitest';
import { useDraftModal } from './useDraftModal';
import { useModal } from './useModal';

interface Child { id: string; name: string }

const nameRequired = (child: Child): FieldErrors =>
    child.name ? {} : { name: { code: 'validation_required' } };

function setup() {
    const modal = useModal<Child>();
    const confirmSpy = vi.spyOn(modal, 'confirm');
    const [draft] = withSetup(() => useDraftModal<Child>(modal, nameRequired));
    return { modal, draft, confirmSpy };
}

describe('useDraftModal', () => {
    it('edits a copy, so cancelling leaves the original untouched', () => {
        const { draft } = setup();
        const original: Child = { id: 'c1', name: 'Camille' };

        draft.show(original);
        draft.data.value.name = 'Changed';

        expect(original.name).toBe('Camille');
    });

    it('hands the edited copy back on confirm', () => {
        const { draft, confirmSpy } = setup();
        draft.show({ id: 'c1', name: 'Camille' });
        draft.data.value.name = 'Renamed';

        draft.confirm();

        expect(confirmSpy).toHaveBeenCalledWith({ id: 'c1', name: 'Renamed' });
    });

    it('stays open, the problem against its field, when the check refuses the copy', () => {
        const { draft, confirmSpy } = setup();
        draft.show({ id: 'c1', name: '' });

        draft.confirm();

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(draft.errors.get('name')).toBe('This field is required.');
    });

    it('opens on the next record with the last one\'s problems cleared', () => {
        const { draft } = setup();
        draft.show({ id: 'c1', name: '' });
        draft.confirm();

        draft.show({ id: 'c2', name: 'Camille' });

        expect(draft.errors.get('name')).toBeUndefined();
    });
});
