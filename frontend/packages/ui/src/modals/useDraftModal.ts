import { ValidationError, type FieldErrors } from '@chapelure/core';
import { useValidationErrors } from '@chapelure/ui/forms/useValidationErrors';
import type { IModalController } from '@chapelure/ui/modals/useModal';
import { ref, toRaw } from 'vue';

/**
 * A modal that edits a copy of a record and hands it back, writing nothing: for a record saved
 * later, with the parent it belongs to. `show` clones what it is handed, and `confirm` resolves
 * the copy — unless `check` finds something the backend would refuse, which stays on screen
 * against its field.
 *
 * `useEditModal` is the one that saves the record itself.
 *
 * @param modal the modal's controller
 * @param check what would be refused, keyed by field as the backend keys it. Empty when nothing.
 */
export function useDraftModal<T>(modal: IModalController<T>, check: (data: T) => FieldErrors = () => ({})) {
    const data = ref<T>({} as T);
    const errors = useValidationErrors();

    function show(record: T) {
        data.value = structuredClone(toRaw(record));
        errors.reset();
        return modal.show();
    }

    function confirm() {
        const problems = check(data.value as T);
        if (Object.keys(problems).length) {
            errors.set(new ValidationError(problems));
            return;
        }

        modal.confirm(data.value as T);
    }

    return {
        data,
        errors,
        cancel: modal.cancel,
        confirm,
        show,
    };
}
