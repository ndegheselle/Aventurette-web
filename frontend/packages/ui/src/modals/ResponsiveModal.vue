<!-- Driven by a useModal controller: <ResponsiveModal :controller height="half" />. A BottomSheet on a phone, a Modal otherwise.
     The `action` slot goes at the sheet's top right, or among the modal's actions; the modal shows its content as expanded. -->
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

const slots = defineSlots<{
    title: any;
    action: any;
    default: (props: { expanded: boolean }) => any;
}>();
</script>

<template>
    <BottomSheet v-if="isMobile" :controller :height>
        <template #title><slot name="title" /></template>
        <template #action><slot name="action" /></template>
        <template #default="{ expanded }"><slot :expanded="expanded" /></template>
    </BottomSheet>
    <Modal v-else :controller :with-actions="!!slots.action">
        <template #title><slot name="title" /></template>
        <template #actions><slot name="action" /></template>
        <slot :expanded="true" />
    </Modal>
</template>
