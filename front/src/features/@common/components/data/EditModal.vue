<script setup lang="ts" generic="T extends BaseEntity">
import { useAlert } from '@common/composables/popups/alert';
import { useDeferredModal } from '@common/composables/popups/modal';
import type { BaseEntity, IDataCrud } from '@api/crud';
import { useValidationErrors } from '@common/utils/dev';
import { reactive, ref, useTemplateRef } from 'vue';

const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const modal = useDeferredModal(dialog);
const alert = useAlert();
const errors = useValidationErrors();

const data = reactive<T>({} as T);
const isLoading = ref(false);

async function confirm() {
    isLoading.value = true;
    errors.reset();
    try {
        if (data.id == null) {
            await crud.create(data as T);
            alert.success('Élément créé avec succès');
        } else {
            await crud.update(data.id, data as T);
            alert.success('Élément modifié avec succès');
        }
        modal.confirm(true);
    } catch (e: any) {
        errors.set(e);
    } finally {
        isLoading.value = false;
    }
}

function isNew() {
    return data.id == null;
}

function show(client: T): Promise<boolean | null> {
    Object.assign(data, client);
    errors.reset();
    return modal.show();
}

defineExpose({ data, show });
const { crud } = defineProps<{crud: IDataCrud<T>}>();
defineSlots<{
    form(props: { data: T, errors: any }): any;
}>();
</script>

<template>
    <dialog ref="dialog" class="modal">
        <div class="modal-box">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="modal.cancel">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <h3 class="text-lg font-bold">
                {{ isNew() ? 'Nouveau' : 'Modifier' }}
            </h3>

            <slot name="form" :data="(data as T)" :errors="errors" />
            
            <!-- Actions -->
            <div class="modal-action">
                <button class="btn btn-neutral" @click="modal.cancel">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Annuler
                </button>
                <button class="btn btn-primary" :disabled="isLoading" @click="confirm">
                    <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                    <i class="fa-solid fa-floppy-disk"></i>
                    {{ isNew() ? 'Créer' : 'Sauvegarder' }}
                </button>
            </div>
        </div>

        <div class="modal-backdrop">
            <button @click="modal.cancel">close</button>
        </div>
    </dialog>
</template>