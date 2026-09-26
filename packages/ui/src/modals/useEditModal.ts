import type { BaseEntity, IDataCrud } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import type { IModalController } from '@chapelure/ui/modals/useModal';
import { computed, ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * A modal that creates or updates one record: `show` clones what it is handed, `confirm` saves
 * it. Which of the two it does depends on whether the record has an id.
 *
 * @param modal the modal's controller
 * @param crud where the record is saved
 */
export function useEditModal<T extends BaseEntity>(modal: IModalController<T>, crud: IDataCrud<T>) {
    const alert = useAlert();

    const data = ref<T>({} as T);
    const isNew = computed(() => data.value?.id == null);

    const { t } = useI18n();

    const { isLoading, errors, submit } = useSubmit(async () => {
        const result = isNew.value
            ? await crud.create(data.value)
            : await crud.update(data.value.id, data.value);

        alert.success(t(isNew.value ? 'data.created' : 'data.updated'));
        modal.confirm(result);
    });


    function show(child: T) {
        const raw = toRaw(child);
        data.value = structuredClone(raw);
        return modal.show();
    }

    return {
        isLoading,
        isNew,
        data,
        errors,
        cancel: modal.cancel,
        confirm: submit,
        show
    };
}
