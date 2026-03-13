<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue';
import { useConfirmation } from '@common/composables/popups/confirmation.ts';

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
                <i v-if="confirmation.icon.value" class="mr-2" :class="confirmation.icon.value"></i>
                <h3 class="text-lg font-bold">{{ confirmation.title }}</h3>
            </div>

            <p v-html="confirmation.message.value"></p>

            <div class="modal-action">
                <button class="btn" @click="confirmation.cancel()">Cancel</button>
                <button class="btn btn-primary" @click="confirmation.confirm()">Confirm</button>
            </div>
        </div>

        <form method="dialog" class="modal-backdrop">
            <button @click="confirmation.cancel()">close</button>
        </form>
    </dialog>
</template>