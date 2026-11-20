<!-- Says, while the planning is picking an activity, what for; with a way to give up and go back. -->
<script setup lang="ts">
import { Alert } from '@chapelure/ui/shadcn/alert';
import { Button } from '@chapelure/ui/shadcn/button';
import { usePlanningPick } from '@features/planning/composables/usePlanningPick';
import { formatPlanStart } from '@features/planning/models/planning';
import { CalendarPlusIcon, XIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { pick, cancel } = usePlanningPick();
const { locale } = useI18n();
</script>

<template>
    <Alert v-if="pick" role="status" class="flex items-center gap-3 bg-muted py-2 [&>svg]:translate-y-0">
        <CalendarPlusIcon />
        <span class="flex-1">{{ $t('planning.pick.for', { when: formatPlanStart(pick.start, locale) }) }}</span>
        <Button type="button" variant="ghost" size="icon-sm" :aria-label="$t('actions.cancel')" @click="cancel">
            <XIcon />
        </Button>
    </Alert>
</template>
