import { computed, ref, type Ref } from 'vue';
import { useDeferredModal } from '@common/composables/popups/modal';
import { useValidationErrors } from '@common/utils/dev';
import { useAlert } from '@common/composables/popups/alert';
import { useI18n } from 'vue-i18n';
import type { BaseEntity, IDataCrud } from '@common/database/crud';

export function useEditModal<T extends BaseEntity>(dialog: Ref<HTMLDialogElement | null>, crud: IDataCrud<T>) {
    const modal = useDeferredModal<T>(dialog);
    const data = ref<T>({} as T);
    const isLoading = ref(false);
    const errors = useValidationErrors();
    const alert = useAlert();
    const { t } = useI18n();
    const isNew = computed(() => data.value?.id == null);

    async function confirm() {
        if (!data.value) return;

        isLoading.value = true;
        errors.reset();
        try {
            if (isNew) {
                await crud.create(data.value);
                alert.success(t('data.created'));
            } else {
                await crud.update(data.value.id, data.value);
                alert.success(t('data.updated'));
            }
            modal.confirm(data.value);
        } catch (e: any) {
            errors.set(e);
        } finally {
            isLoading.value = false;
        }
    }

    function show(child: T) {
        data.value = child;
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