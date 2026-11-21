<!-- A button opening a step's tips in a sheet. Renders nothing when there are none. -->
<script setup lang="ts">
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { Alert, AlertDescription, AlertTitle } from '@chapelure/ui/shadcn/alert';
import { Button } from '@chapelure/ui/shadcn/button';
import type { ActivityTipData } from '@features/activities/models/step';
import { InfoIcon } from 'lucide-vue-next';

defineProps<{
    tips: ActivityTipData[];
}>();

const sheet = useModal();
</script>

<template>
    <template v-if="tips.length">
        <Button type="button" variant="secondary" size="icon-lg"
                :aria-label="$t('activities.tips.title')" @click="() => sheet.show()">
            <InfoIcon />
        </Button>

        <ResponsiveModal :controller="sheet">
            <template #title>{{ $t('activities.tips.title') }}</template>
            <div class="flex flex-col gap-2">
                <Alert v-for="tip in tips" :key="tip.id">
                    <AlertTitle class="line-clamp-none">{{ tip.name }}</AlertTitle>
                    <AlertDescription>
                        <div v-html="tip.description"></div>
                    </AlertDescription>
                </Alert>
            </div>
        </ResponsiveModal>
    </template>
</template>
