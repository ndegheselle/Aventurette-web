<!-- Example of a reusable modal -->
<script setup lang="ts" generic="T = boolean">
import { useModal, type IModalController } from '@chapelure/ui/composables/useModal';
import { CheckIcon, XIcon } from '@chapelure/ui/icons';
import { useTemplateRef, watch } from 'vue';

const { controller = useModal(), withActions = true } = defineProps<{
    withActions?: boolean,
    controller?: IModalController<T>
}>();

const dialog = useTemplateRef<HTMLDialogElement>('dialog');

watch(controller.isShown, (isShown) => {
    if (isShown) {
        dialog.value?.show();
    } else {
        dialog.value?.close();
    }
});

defineSlots<{
    title: any;
    default: any;
    actions: any;
}>();
</script>

<template>
    <dialog ref="dialog"
            class="modal">
        <div class="modal-box max-w-5xl">
            <div class="flex">
                <h3 class="text-lg font-bold">
                    <slot name="title" />
                </h3>
                <button class="btn btn-sm btn-circle btn-ghost ms-auto"
                        @click="() => controller.cancel()">
                    <XIcon />
                </button>
            </div>

            <div class="overflow-y-auto">
                <slot />
            </div>

            <!-- Actions -->
            <div class="modal-action"
                 v-if="withActions">
                <slot name="actions">
                    <button class="btn"
                            @click="() => controller.cancel()">
                        <XIcon />
                        {{ $t("actions.cancel") }}
                    </button>
                    <button class="btn btn-primary"
                            @click="() => controller.confirm(true as any)">
                        <CheckIcon />
                        {{ $t("actions.confirm") }}
                    </button>
                </slot>
            </div>
        </div>

        <div class="modal-backdrop">
            <button @click="() => controller.cancel()">close</button>
        </div>
    </dialog>
</template>