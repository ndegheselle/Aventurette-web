<!--
  An activity's safety instructions and tips, as two icon buttons, each opening a modal with
  every entry in full. A button shows only when there is something behind it.
-->
<script setup vapor lang="ts">
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import type { ActivityTipData, SafetyInstructionData } from '@features/activities/model/activity';
import { InfoIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
    safety: SafetyInstructionData[],
    tips: ActivityTipData[],
}>();

const safetyModal = useModal();
const tipsModal = useModal();
</script>

<template>
    <button v-if="safety.length"
            class="btn btn-soft btn-warning"
            :title="t('activities.fields.safetyInstructions')"
            :aria-label="t('activities.fields.safetyInstructions')"
            @click="safetyModal.show()">
        <TriangleAlertIcon /> {{ safety.length }}
    </button>
    <button v-if="tips.length"
            class="btn btn-soft btn-info"
            :title="t('activities.tips.title')"
            :aria-label="t('activities.tips.title')"
            @click="tipsModal.show()">
        <InfoIcon /> {{ tips.length }}
    </button>

    <Modal :controller="safetyModal"
           :withActions="false">
        <template #title>
            <span class="flex items-center gap-2">
                <TriangleAlertIcon class="text-warning" /> {{ t('activities.fields.safetyInstructions') }}
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

    <Modal :controller="tipsModal"
           :withActions="false">
        <template #title>
            <span class="flex items-center gap-2">
                <InfoIcon class="text-info" /> {{ t('activities.tips.title') }}
            </span>
        </template>
        <div class="flex flex-col gap-2 mt-4">
            <div v-for="tip in tips"
                 :key="tip.id"
                 role="alert"
                 class="alert alert-info alert-soft items-start">
                <div>
                    <b>{{ tip.name }}</b>
                    <div v-html="tip.description"></div>
                </div>
            </div>
        </div>
    </Modal>
</template>
