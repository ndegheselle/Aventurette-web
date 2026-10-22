<!-- The button that plans the activity: a sheet to pick when, then the plan is saved. Styled by
     the caller, like the heart beside it: the classes given to it land on the button. -->
<script setup lang="ts">
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import type { ActivityData } from '@features/activities/models/activity';
import { usePlanActivity } from '@features/planning/composables/usePlanActivity';
import { CalendarPlusIcon, CheckIcon, XIcon } from 'lucide-vue-next';

defineOptions({ inheritAttrs: false });

defineProps<{
    activity: ActivityData;
}>();

const { picker, start, canConfirm, plan } = usePlanActivity();
</script>

<template>
    <button type="button" v-bind="$attrs" :aria-label="$t('planning.actions.plan')" @click="plan(activity)">
        <CalendarPlusIcon />
    </button>

    <!-- Out to the body: the actions holding the button stick above the dock on a phone, and the
         sheet would open under it. -->
    <Teleport to="body">
        <ResponsiveModal :controller="picker">
            <template #title>{{ $t('planning.plan.title') }}</template>
            <div class="flex flex-col gap-4">
                <label class="flex flex-col gap-1">
                    <span>{{ $t('planning.plan.when', { name: activity.name }) }}</span>
                    <input v-model="start" type="datetime-local" class="input w-full" />
                </label>
                <div class="flex justify-end gap-2">
                    <button type="button" class="btn" @click="picker.cancel()">
                        <XIcon />
                        {{ $t('actions.cancel') }}
                    </button>
                    <button type="button" class="btn btn-primary" :disabled="!canConfirm" @click="picker.confirm(true)">
                        <CheckIcon />
                        {{ $t('planning.actions.plan') }}
                    </button>
                </div>
            </div>
        </ResponsiveModal>
    </Teleport>
</template>
