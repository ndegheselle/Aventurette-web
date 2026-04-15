import { computed, ref, type Ref } from 'vue';
import { useDeferredModal } from '@common/composables/popups/modal';
import { useValidationErrors } from '@common/utils/dev';
import { useAlert } from '@common/composables/popups/alert';
import { useI18n } from 'vue-i18n';
import type { BaseEntity, IDataCrud } from '@api/crud';
import { toRaw } from 'vue';

export function useEditModal<T extends BaseEntity>(dialog: Ref<HTMLDialogElement | null>, crud: IDataCrud<T>) {
    const modal = useDeferredModal<T>(dialog);
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