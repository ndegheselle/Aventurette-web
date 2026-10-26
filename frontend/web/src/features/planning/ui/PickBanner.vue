<!-- Says, while the planning is picking an activity, what for; with a way to give up and go back. -->
<script setup lang="ts">
import { usePlanningPick } from '@features/planning/composables/usePlanningPick';
import { formatPlanStart } from '@features/planning/models/planning';
import { CalendarPlusIcon, XIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { pick, cancel } = usePlanningPick();
const { locale } = useI18n();
</script>

<template>
    <div v-if="pick" role="status" class="alert alert-soft alert-accent">
        <CalendarPlusIcon />
        <span>{{ $t('planning.pick.for', { when: formatPlanStart(pick.start, locale) }) }}</span>
        <button type="button" class="btn btn-sm btn-ghost btn-square" :aria-label="$t('actions.cancel')" @click="cancel">
            <XIcon />
        </button>
    </div>
</template>
