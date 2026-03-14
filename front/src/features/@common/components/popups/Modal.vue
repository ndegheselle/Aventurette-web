<!-- Example of a reusable modal -->
<script setup lang="ts" generic="T = boolean">
import { useDeferredModal } from '@common/composables/popups/modal';
import { useTemplateRef } from 'vue';

const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const modal = useDeferredModal<T>(dialog);

const {withActions = true} = defineProps<{
    withActions?: boolean
}>();
defineExpose({ confirm: modal.confirm, show: modal.show });
defineSlots<{
    title: any;
    body: any;
    actions: any;
}>();
</script>

<template>
    <dialog ref="dialog"
            class="modal">
        <div class="modal-box">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    @click="modal.cancel()">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <h3 class="text-lg font-bold">
                <slot name="title" />
            </h3>

            <slot name="body" />

            <!-- Actions -->
            <div class="modal-action" v-if="withActions">
                <slot name="actions">
                    <button class="btn btn-neutral"
                            @click="modal.cancel()">
                        <i class="fa-solid fa-circle-xmark"></i>
                        Annuler
                    </button>
                    <button class="btn btn-primary"
                            @click="modal.confirm()">
                        Confirmer
                    </button>
                </slot>
            </div>
        </div>

        <div class="modal-backdrop">
            <button @click="modal.cancel()">close</button>
        </div>
    </dialog>
</template>