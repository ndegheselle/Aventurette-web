import type { IEditModal } from '@chapelure/common/composables/popups/useModal';
import { shallowRef, type Ref } from 'vue';

/**
 * Options of an editable list
 */
export interface IEditableListOptions<T> {
    /**
     * React to an item deletion (example, use a confirmation message and then delete on the server)
     * @param item to delete
     * @returns false if the deletion is not desired
     */
    onRemove?: (item: T) => Promise<boolean | void>;
}

/**
 * Handle an editable list where you can add, edit and remove items.
 * @param modal to edit the items
 * @param options
 * @returns 
 */
export function useEditableList<T extends {}>(modal: Ref<IEditModal<T> | null>, options?: IEditableListOptions<T>) {
    const items = shallowRef<T[]>([]);

    async function add(item: T) {
        if (!modal.value) return;
        const newItem = await modal.value.show(item);
        if (newItem) items.value = [...items.value, newItem];
    }

    async function remove(item: T, index: number) {
        if (await options?.onRemove?.(item) === false) return;
        items.value = items.value.filter((_, i) => i !== index);
    }

    async function edit(item: T) {
        if (!modal.value) return;
        const updated = await modal.value.show(item);
        if (updated) Object.assign(item, updated);
    }

    return { items, add, remove, edit };
}