<script setup lang="ts">
import type { ActivityData } from '@features/activities/composables/data/activities';
import { useAgeDisplay } from '@features/activities/locales/helpers';
import { ClockIcon, MapIcon, UserRoundIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { activity } = defineProps<{
    activity?: ActivityData
}>();

const ageDisplay = computed(() => useAgeDisplay(t, activity?.ageMin, activity?.ageMax));
</script>

<template>
    <div class="flex gap-1">
        <span class="badge">
            <MapIcon /> {{ $t("activities.environment." + activity?.environment) }}
        </span>
        <span class="badge">
            <UserRoundIcon /> {{ ageDisplay }}
        </span>
        <span class="badge">
            <ClockIcon /> {{ $t("activities.duration", { duration: activity?.durationMinutes }) }}
        </span>
    </div>
</template>