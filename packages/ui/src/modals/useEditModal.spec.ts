import { ValidationError, type BaseEntity } from '@chapelure/core';
import { fakeCrud, withSetup } from '@tests';
import { describe, expect, it, vi } from 'vitest';
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useEditModal } from './useEditModal';
import { useModal } from './useModal';

interface Child extends BaseEntity { name: string }

function setup(seed: Child[] = []) {
    const crud = fakeCrud<Child>(seed);
    const modal = useModal<Child>();
    const confirmSpy = vi.spyOn(modal, 'confirm');
    const [edit] = withSetup(() => useEditModal<Child>(modal, crud));
    return { crud, modal, edit, confirmSpy };
}

describe('useEditModal', () => {
    describe('show', () => {
        it('edits a copy, so cancelling leaves the original untouched', () => {
            const { edit } = setup();
            const original: Child = { id: 'c1', name: 'Camille' };

            edit.show(original);
            edit.data.value.name = 'Changed';

            expect(original.name).toBe('Camille');
        });

        it('treats a record with no id as a creation', () => {
            const { edit } = setup();

            edit.show({ name: 'New' } as Child);

            expect(edit.isNew.value).toBe(true);
        });

        it('treats a record with an id as an update', () => {
            const { edit } = setup();

            edit.show({ id: 'c1', name: 'Camille' });

            expect(edit.isNew.value).toBe(false);
        });
    });

    describe('confirm', () => {
        it('creates when the record is new, and hands the saved record back', async () => {
            const { edit, crud, confirmSpy } = setup();
            edit.show({ name: 'Camille' } as Child);

            await edit.confirm();

            expect(crud.items).toHaveLength(1);
            expect(confirmSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Camille' }));
        });

        it('updates when the record already exists', async () => {
            const { edit, crud } = setup([{ id: 'c1', name: 'Camille' }]);
            edit.show({ id: 'c1', name: 'Camille' });
            edit.data.value.name = 'Renamed';

            await edit.confirm();

            expect(crud.items).toEqual([{ id: 'c1', name: 'Renamed' }]);
        });

        it('announces the save', async () => {
            const { edit } = setup();
            const { alerts } = useAlert();
            alerts.value = [];
            edit.show({ name: 'Camille' } as Child);

            await edit.confirm();

            expect(alerts.value.map(a => a.message)).toEqual(['Created successfully!']);
        });

        it('shows the busy state while saving and clears it after', async () => {
            const { edit } = setup();
            edit.show({ name: 'Camille' } as Child);

            const saving = edit.confirm();
            expect(edit.isLoading.value).toBe(true);
            await saving;

            expect(edit.isLoading.value).toBe(false);
        });

        it('keeps the modal open and shows the field errors when the save is rejected', async () => {
            const { edit, crud, confirmSpy } = setup();
            crud.failNextWith({ name: { code: 'validation_required' } });
            edit.show({ name: '' } as Child);

            await edit.confirm();

            expect(confirmSpy).not.toHaveBeenCalled();
            expect(edit.errors.get('name')).toBe('This field is required.');
            expect(edit.isLoading.value).toBe(false);
        });

        it('clears the previous errors before retrying', async () => {
            const { edit, crud } = setup();
            crud.failNextWith({ name: { code: 'validation_required' } });
            edit.show({ name: '' } as Child);
            await edit.confirm();

            edit.data.value.name = 'Camille';
            await edit.confirm();

            expect(edit.errors.get('name')).toBeUndefined();
        });

        it('reports a failure with no field detail as a global message', async () => {
            const { edit, crud } = setup();
            crud.failNextWith({});
            edit.show({ name: '' } as Child);

            await edit.confirm();

            expect(edit.errors.global.value).toBe('Something went wrong.');
        });
    });

    it('cancel is the modal\'s own, so a caller cannot forget to resolve the promise', () => {
        const { edit, modal } = setup();
        expect(edit.cancel).toBe(modal.cancel);
    });

    it('surfaces a rejection as a ValidationError from the adapter, not a raw throw', async () => {
        const { edit, crud } = setup();
        crud.failNextWith({ name: { code: 'validation_required' } });
        edit.show({ name: '' } as Child);

        await expect(edit.confirm()).resolves.toBeUndefined();
        expect(crud.items).toHaveLength(0);
        expect(new ValidationError({}).name).toBe('ValidationError');
    });
});
