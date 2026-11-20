<!-- A warning button opening the activity's safety instructions in a sheet. Renders nothing when
     there are none. -->
<script setup lang="ts">
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import type { ActivityData } from '@features/activities/models/activity';
import { TriangleAlertIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();

const sheet = useModal();
</script>

<template>
    <template v-if="activity.safety.instructions.length">
        <button type="button" class="btn btn-warning btn-square btn-lg"
                :aria-label="$t('activities.fields.safetyInstructions')" @click="() => sheet.show()">
            <TriangleAlertIcon />
        </button>

        <ResponsiveModal :controller="sheet">
            <template #title>{{ $t('activities.fields.safetyInstructions') }}</template>
            <div class="flex flex-col gap-1">
                <div v-for="instruction in activity.safety.instructions" :key="instruction.id" role="alert"
                     class="alert items-start">
                    <div>
                        <b>{{ instruction.name }}</b>
                        <div v-if="instruction.description" v-html="instruction.description"></div>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    </template>
</template>
