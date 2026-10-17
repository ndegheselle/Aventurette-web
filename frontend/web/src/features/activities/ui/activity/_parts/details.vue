<!-- What running the activity takes: safety, materials, workshops and steps. -->
<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import type { ActivityData } from '@features/activities/models/activity';
import { stepNumber } from '@features/activities/models/step';
import { PackageOpenIcon, ShieldAlertIcon, UsersIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();
</script>

<template>
    <div class="flex flex-col gap-2">
        <Panel v-if="activity.safety.instructions.length">
            <h2 class="text-lg flex items-center gap-2">
                <ShieldAlertIcon class="opacity-50" /> {{ $t('activities.fields.safetyInstructions') }}
            </h2>
            <ul class="list-disc ps-5">
                <li v-for="instruction in activity.safety.instructions" :key="instruction.id">
                    {{ instruction.name }}
                </li>
            </ul>
        </Panel>

        <Panel v-if="activity.materials.length">
            <h2 class="text-lg flex items-center gap-2">
                <PackageOpenIcon class="opacity-50" /> {{ $t('activities.materials.title') }}
            </h2>
            <ul class="flex flex-col gap-1">
                <li v-for="material in activity.materials" :key="material.id"
                    class="flex justify-between gap-2">
                    <span>{{ material.name }}</span>
                    <span v-if="material.quantity" class="opacity-60">{{ material.quantity }}</span>
                </li>
            </ul>
        </Panel>

        <Panel v-if="activity.workshops.length">
            <h2 class="text-lg flex items-center gap-2">
                <UsersIcon class="opacity-50" /> {{ $t('activities.workshops.title') }}
            </h2>
            <List :items="activity.workshops" v-slot="{ item }">
                <div>
                    <b>{{ item.name }}</b>
                    <span v-if="item.theme" class="ms-2 text-sm opacity-60">{{ item.theme }}</span>
                    <div class="text-xs" v-html="item.challenges"></div>
                </div>
                <span v-if="item.adults_required" class="badge">
                    {{ $t('activities.workshops.adults', { count: item.adults_required }) }}
                </span>
            </List>
        </Panel>

        <List :items="activity.steps" v-slot="{ item, index }">
            <div class="text-4xl font-thin opacity-30 tabular-nums">{{ stepNumber(index) }}</div>
            <div>
                <b v-if="item.title">{{ item.title }}</b>
                <span v-if="item.duration" class="ms-2 text-xs opacity-60">
                    {{ $t('activities.minutes', { minutes: item.duration }) }}
                </span>
                <div class="text-xs" v-html="item.description"></div>
            </div>
        </List>
    </div>
</template>
