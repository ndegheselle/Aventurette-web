<!--
  An activity's safety instructions, as an icon button opening a modal with every entry in full.
  It shows only when there is something behind it.
-->
<script setup lang="ts">
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import type { SafetyInstructionData } from '@features/activities/model/activity';
import { TriangleAlertIcon } from 'lucide-vue-next';

defineProps<{
    safety: SafetyInstructionData[],
}>();

const safetyModal = useModal();
</script>

<template>
    <button v-if="safety.length"
            class="btn btn-soft btn-warning"
            :title="$t('activities.fields.safetyInstructions')"
            :aria-label="$t('activities.fields.safetyInstructions')"
            @click="safetyModal.show()">
        <TriangleAlertIcon /> {{ safety.length }}
    </button>

    <Modal :controller="safetyModal"
           :withActions="false">
        <template #title>
            <span class="flex items-center gap-2">
                <TriangleAlertIcon class="text-warning" /> {{ $t('activities.fields.safetyInstructions') }}
            </span>
        </template>
        <div class="flex flex-col gap-2 mt-4">
            <div v-for="instruction in safety"
                 :key="instruction.id"
                 role="alert"
                 class="alert alert-warning alert-soft items-start">
                <div>
                    <b>{{ instruction.name }}</b>
                    <div v-html="instruction.description"></div>
                </div>
            </div>
        </div>
    </Modal>
</template>
