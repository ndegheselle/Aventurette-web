<script setup lang="ts">
import { useConfirmation } from '@common/composables/popups/confirmation.ts';
import { CheckIcon, XIcon } from 'lucide-vue-next';
import { onMounted, useTemplateRef } from 'vue';

const confirmation = useConfirmation();
const dialog = useTemplateRef<HTMLDialogElement>('dialog');

onMounted(() => {
    if (dialog.value) {
        confirmation.registerDialog(dialog.value);
    }
});
</script>
<template>
    <dialog class="modal" ref="dialog">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </form>

            <div class="flex items-center mb-1">
                <component :is="confirmation.icon.value" v-if="confirmation.icon.value" class="mr-2 icon-lg" />
                <h3 class="text-lg font-bold">{{ confirmation.title }}</h3>
            </div>

            <p v-html="confirmation.message.value"></p>

            <div class="modal-action">
                <button class="btn" @click="confirmation.cancel()">
                    <XIcon />
                    {{ $t("actions.cancel") }}
                </button>
                <button class="btn btn-primary" @click="confirmation.confirm()">
                    <CheckIcon />
                    {{ $t("actions.confirm") }}
                </button>
            </div>
        </div>

        <form method="dialog" class="modal-backdrop">
            <button @click="confirmation.cancel()">close</button>
        </form>
    </dialog>
</template>