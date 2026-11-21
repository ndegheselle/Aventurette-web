<!-- A warning button opening the activity's safety instructions in a sheet. Renders nothing when
     there are none. -->
<script setup lang="ts">
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { Alert, AlertDescription, AlertTitle } from '@chapelure/ui/shadcn/alert';
import { Button } from '@chapelure/ui/shadcn/button';
import type { ActivityData } from '@features/activities/models/activity';
import { TriangleAlertIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();

const sheet = useModal();
</script>

<template>
    <template v-if="activity.safety.instructions.length">
        <Button type="button" variant="destructive" size="icon-lg"
                :aria-label="$t('activities.fields.safetyInstructions')" @click="() => sheet.show()">
            <TriangleAlertIcon />
        </Button>

        <ResponsiveModal :controller="sheet">
            <template #title>{{ $t('activities.fields.safetyInstructions') }}</template>
            <div class="flex flex-col gap-1">
                <Alert v-for="instruction in activity.safety.instructions" :key="instruction.id">
                    <AlertTitle class="line-clamp-none">{{ instruction.name }}</AlertTitle>
                    <AlertDescription v-if="instruction.description">
                        <div v-html="instruction.description"></div>
                    </AlertDescription>
                </Alert>
            </div>
        </ResponsiveModal>
    </template>
</template>
