import type { BaseEntity, IDataCrud } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/composables/useAlert';
import type { IModalController } from '@chapelure/ui/composables/useModal';
import { useValidationErrors } from '@chapelure/ui/composables/useValidationErrors';
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

    const isLoading = ref(false);
    const errors = useValidationErrors();
    const { t } = useI18n();

    async function confirm() {
        if (!data.value) return;

        isLoading.value = true;
        errors.reset();
        try {
            let result;
            if (isNew.value) {
                result = await crud.create(data.value);
                alert.success(t('data.created'));
            } else {
                result = await crud.update(data.value.id, data.value);
                alert.success(t('data.updated'));
            }
            modal.confirm(result);
        } catch (e: any) {
            errors.set(e);
        } finally {
            isLoading.value = false;
        }
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