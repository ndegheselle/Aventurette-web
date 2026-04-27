<script setup lang="ts">
import type { ActivityData } from '@features/activities/data/activities';
import { ClockIcon, MapIcon, UserRoundIcon } from 'lucide-vue-next';
const { activity } = defineProps<{
    activity?: ActivityData
}>();
</script>

<template>
    <div class="flex gap-1">
        <span class="badge">
            <MapIcon /> {{ $t("activities.environnement." + activity?.environnement) }}
        </span>
        <span class="badge">
            <UserRoundIcon /> {{ $t("activities.age", { min: activity?.ageMin, max: activity?.ageMax }) }}
        </span>
        <span class="badge">
            <ClockIcon /> {{ $t("activities.duration", { duration: activity?.durationMinutes }) }}
        </span>
    </div>
</template>