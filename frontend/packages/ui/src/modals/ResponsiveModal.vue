<!-- Driven by a useModal controller: <ResponsiveModal :controller height="half" />. A BottomSheet on a phone, a Modal without actions otherwise. -->
<script setup lang="ts" generic="T = boolean">
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import BottomSheet, { type BottomSheetHeight } from '@chapelure/ui/modals/BottomSheet.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal, type IModalController } from '@chapelure/ui/modals/useModal';

const { controller = useModal(), height = 'auto' } = defineProps<{
    controller?: IModalController<T>;
    /** The sheet's height on a phone; the modal fits its content. */
    height?: BottomSheetHeight;
}>();

const { isMobile } = useIsMobile();

defineSlots<{
    title: any;
    default: any;
}>();
</script>

<template>
    <BottomSheet v-if="isMobile" :controller :height>
        <template #title><slot name="title" /></template>
        <slot />
    </BottomSheet>
    <Modal v-else :controller :with-actions="false">
        <template #title><slot name="title" /></template>
        <slot />
    </Modal>
</template>
