import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { IEditModal } from './useModal';
import { useEditableList } from './useEditableList';

interface Child { id?: string; name: string }

/** A stand-in for the edit modal component, answering with whatever the test decides. */
function stubModal(answers: (Child | null)[]) {
    const shown: Child[] = [];
    const modal = ref<IEditModal<Child> | null>({
        show: async (item: Child) => {
            shown.push(item);
            return answers.shift() ?? null;
        },
    });
    return { modal, shown };
}

describe('useEditableList', () => {
    it('starts empty', () => {
        const { modal } = stubModal([]);
        expect(useEditableList(modal).items.value).toEqual([]);
    });

    describe('add', () => {
        it('appends what the modal returned', async () => {
            const { modal } = stubModal([{ id: 'c1', name: 'Camille' }]);
            const list = useEditableList(modal);

            await list.add({ name: '' });

            expect(list.items.value).toEqual([{ id: 'c1', name: 'Camille' }]);
        });

        it('opens the modal seeded with the blank item it was given', async () => {
            const { modal, shown } = stubModal([{ name: 'x' }]);
            const list = useEditableList(modal);

            await list.add({ name: 'template' });

            expect(shown).toEqual([{ name: 'template' }]);
        });

        it('adds nothing when the modal is cancelled', async () => {
            const { modal } = stubModal([null]);
            const list = useEditableList(modal);

            await list.add({ name: '' });

            expect(list.items.value).toEqual([]);
        });

        it('does nothing when no modal is mounted yet', async () => {
            const list = useEditableList(ref<IEditModal<Child> | null>(null));

            await expect(list.add({ name: '' })).resolves.toBeUndefined();
            expect(list.items.value).toEqual([]);
        });

        it('replaces the array rather than mutating it, so shallowRef re-renders', async () => {
            const { modal } = stubModal([{ name: 'a' }]);
            const list = useEditableList(modal);
            const before = list.items.value;

            await list.add({ name: '' });

            expect(list.items.value).not.toBe(before);
        });
    });

    describe('remove', () => {
        it('removes the item at the given index', async () => {
            const { modal } = stubModal([]);
            const list = useEditableList(modal);
            list.items.value = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];

            await list.remove(list.items.value[1]!, 1);

            expect(list.items.value.map(i => i.name)).toEqual(['a', 'c']);
        });

        it('keeps the item when onRemove declines', async () => {
            const { modal } = stubModal([]);
            const list = useEditableList(modal, { onRemove: async () => false });
            list.items.value = [{ name: 'a' }];

            await list.remove(list.items.value[0]!, 0);

            expect(list.items.value).toHaveLength(1);
        });

        it('removes when onRemove returns nothing, so a plain confirmation hook still works', async () => {
            const onRemove = vi.fn(async () => { });
            const { modal } = stubModal([]);
            const list = useEditableList(modal, { onRemove });
            list.items.value = [{ name: 'a' }];

            await list.remove(list.items.value[0]!, 0);

            expect(onRemove).toHaveBeenCalledOnce();
            expect(list.items.value).toHaveLength(0);
        });
    });

    describe('edit', () => {
        it('writes the modal\'s result back onto the item in place', async () => {
            const { modal } = stubModal([{ id: 'c1', name: 'Camille renamed' }]);
            const list = useEditableList(modal);
            list.items.value = [{ id: 'c1', name: 'Camille' }];
            const original = list.items.value[0]!;

            await list.edit(original);

            expect(original.name).toBe('Camille renamed');
        });

        it('leaves the item alone when the modal is cancelled', async () => {
            const { modal } = stubModal([null]);
            const list = useEditableList(modal);
            list.items.value = [{ id: 'c1', name: 'Camille' }];

            await list.edit(list.items.value[0]!);

            expect(list.items.value[0]!.name).toBe('Camille');
        });
    });
});
