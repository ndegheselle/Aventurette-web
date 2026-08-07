<script setup lang="ts">
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { useConfirmation } from '@chapelure/common/composables/popups/useConfirmation';
import { useModal } from '@chapelure/common/composables/popups/useModal';
import { onMounted } from 'vue';

const confirmation = useConfirmation();
const controller = useModal();

onMounted(() => {
    confirmation.registerModal(controller);
});
</script>
<template>
    <Modal :controller="controller">
        <template #title>
            <span class="flex">
                <component :is="confirmation.icon.value" v-if="confirmation.icon.value"
                    class="mr-2 my-auto icon-lg inline" />
                {{ confirmation.title }}
            </span>
        </template>
        <p v-html="confirmation.message.value"></p>
    </Modal>
</template>
