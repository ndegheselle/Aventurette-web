<!-- The sheet planning an activity: find it by name, pick when, then the plan is saved. Opened from
     the planning page, which reads its calendar again on `planned`. -->
<script setup lang="ts">
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { timingOf } from '@features/activities/models/activity';
import { usePlanActivity } from '@features/planning/composables/usePlanActivity';
import { CheckIcon, CircleQuestionMarkIcon, XIcon } from 'lucide-vue-next';

const emit = defineEmits<{
    planned: [];
}>();

const { picker, search, found, chosen, start, canConfirm, find, choose, plan } = usePlanActivity();

async function show() {
    if (await plan()) emit('planned');
}

defineExpose({ show });
</script>

<template>
    <ResponsiveModal :controller="picker">
        <template #title>{{ $t('planning.plan.title') }}</template>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <span>{{ $t('planning.plan.which') }}</span>
                <SearchInput v-model="search" @search="find" />
                <ul class="menu w-full bg-base-200 rounded-box max-h-72 overflow-y-auto flex-nowrap">
                    <li v-for="activity in found" :key="activity.id">
                        <button type="button" :class="{ 'menu-active': chosen?.id === activity.id }"
                                :aria-pressed="chosen?.id === activity.id" @click="choose(activity)">
                            <span class="flex-1 text-start">{{ activity.name }}</span>
                            <span class="badge badge-sm">{{ $t('activities.minutes', { minutes: timingOf(activity).total }) }}</span>
                        </button>
                    </li>
                    <li v-if="!found.length" class="opacity-50">
                        <span><CircleQuestionMarkIcon class="icon-sm" />{{ $t('data.noData') }}</span>
                    </li>
                </ul>
            </div>
            <label class="flex flex-col gap-1">
                <span>{{ $t('planning.plan.when') }}</span>
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
</template>
