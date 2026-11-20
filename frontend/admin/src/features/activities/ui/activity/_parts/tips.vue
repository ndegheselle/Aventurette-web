<!-- A button opening a step's tips in a sheet. Renders nothing when there are none. -->
<script setup lang="ts">
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import type { ActivityTipData } from '@features/activities/models/step';
import { InfoIcon } from 'lucide-vue-next';

defineProps<{
    tips: ActivityTipData[];
}>();

const sheet = useModal();
</script>

<template>
    <template v-if="tips.length">
        <button type="button" class="btn btn-soft btn-info btn-square btn-lg"
                :aria-label="$t('activities.tips.title')" @click="() => sheet.show()">
            <InfoIcon />
        </button>

        <ResponsiveModal :controller="sheet">
            <template #title>{{ $t('activities.tips.title') }}</template>
            <div class="flex flex-col gap-2">
                <div v-for="tip in tips" :key="tip.id" role="alert" class="alert items-start">
                    <div>
                        <b>{{ tip.name }}</b>
                        <div v-html="tip.description"></div>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    </template>
</template>
