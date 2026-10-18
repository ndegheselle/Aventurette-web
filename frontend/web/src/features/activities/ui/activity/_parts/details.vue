<!-- What running the activity takes: safety, materials and resources, workshops and steps. -->
<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import type { ActivityData } from '@features/activities/models/activity';
import { stepNumber, type ActivityResourceData } from '@features/activities/models/step';
import Supplies from '@features/activities/ui/activity/_parts/supplies.vue';
import { PackageOpenIcon, ShieldAlertIcon, UsersIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
    /** Gathered from the steps: an activity holds none of its own. */
    resources: ActivityResourceData[];
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

        <Panel v-if="activity.materials.length || resources.length">
            <h2 class="text-lg flex items-center gap-2">
                <PackageOpenIcon class="opacity-50" /> {{ $t('activities.supplies.title') }}
            </h2>
            <Supplies :materials="activity.materials" :resources="resources" />
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
