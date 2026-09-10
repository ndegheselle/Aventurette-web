import type { BaseEntity, IDataCrud } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/composables/useAlert';
import type { IModalController } from '@chapelure/ui/composables/useModal';
import { useSubmit } from '@chapelure/ui/composables/useSubmit';
import { computed, ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Edit modal logic to edit and create
 * @param modal controller of the modal
 * @param crud crud service to save and update the data
 * @returns
 */
export function useEditModal<T extends BaseEntity>(modal: IModalController<T>, crud: IDataCrud<T>) {
    const alert = useAlert();

    const data = ref<T>({} as T);
    const isNew = computed(() => data.value?.id == null);

    const { t } = useI18n();

    // The busy/reset/report cycle is useSubmit's; what is left here is what saving means.
    const { isLoading, errors, submit } = useSubmit(async () => {
        const result = isNew.value
            ? await crud.create(data.value)
            : await crud.update(data.value.id, data.value);

        alert.success(t(isNew.value ? 'data.created' : 'data.updated'));
        modal.confirm(result);
    });

    async function confirm() {
        if (!data.value) return;
        await submit();
    }

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
        confirm,
        show
    };
}
