<script setup lang="ts">
import { ClockIcon, MapIcon, UserRoundIcon } from 'lucide-vue-next';
import type { ActivityData } from '@features/activities/model/activity';
import { formatAgeRange } from '@features/activities/model/age';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { activity } = defineProps<{
    activity?: ActivityData
}>();

const ageDisplay = computed(() => formatAgeRange(t, activity?.ageMin, activity?.ageMax));
</script>

<template>
    <div class="flex gap-1">
        <span class="badge badge-soft badge-primary">
            <MapIcon /> {{ $t("activities.environment." + activity?.environment) }}
        </span>
        <span class="badge badge-soft badge-primary">
            <UserRoundIcon /> {{ ageDisplay }}
        </span>
        <span class="badge badge-soft badge-primary">
            <ClockIcon /> {{ $t("activities.duration", { duration: activity?.durationMinutes }) }}
        </span>
    </div>
</template>
