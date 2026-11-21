<!-- The button that adds the activity to the planning, then opens the planning on it. Styled by the
     caller, like the heart beside it: the `variant`, `size` and classes given to it land on the
     button. While the planning is picking an activity, it stands out and says what it does. -->
<script setup lang="ts">
import { Button } from '@chapelure/ui/shadcn/button';
import type { ActivityData } from '@features/activities/models/activity';
import { usePlanActivity } from '@features/planning/composables/usePlanActivity';
import { CalendarPlusIcon } from 'lucide-vue-next';

defineOptions({ inheritAttrs: false });

defineProps<{
    activity: ActivityData;
}>();

const { picking, plan } = usePlanActivity();
</script>

<template>
    <Button type="button" v-bind="{ ...$attrs, ...(picking ? { variant: 'default', size: 'lg' } : {}) }"
            :aria-label="$t('planning.actions.plan')" @click="plan(activity)">
        <CalendarPlusIcon />
        <span v-if="picking">{{ $t('planning.actions.plan') }}</span>
    </Button>
</template>
