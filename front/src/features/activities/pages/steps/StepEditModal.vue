<script setup lang="ts">
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { useEditModal } from '@chapelure/common/composables/data/useEditModal';
import { useModal } from '@chapelure/common/composables/popups/useModal';
import { useChildrens, type ChildrenData } from '@features/users/composables/data/childrens';

const controller = useModal<ChildrenData>();
const childrens = useChildrens();
const { show, confirm, cancel, isNew, data, errors, isLoading } = useEditModal(controller, childrens);
defineExpose({ show });
</script>

<template>
    <Modal :controller="controller">
        <template #title>
            {{ isNew ? $t('actions.new') : $t('actions.update') }}
        </template>
    </Modal>
</template>