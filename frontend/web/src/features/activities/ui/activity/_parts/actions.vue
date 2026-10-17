<!-- The activity's actions: play it, present it, keep it. -->
<script setup lang="ts">
import type { ActivityData } from '@features/activities/models/activity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { HeartIcon, PlayIcon, PresentationIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();
</script>

<template>
    <div class="flex gap-4">
        <RouterLink class="btn btn-soft btn-square btn-lg" :aria-label="$t('activities.actions.start')"
                    :to="{ name: activitiesRoutesNames.play, params: { id: activity.id } }">
            <PlayIcon />
        </RouterLink>
        <button type="button" class="btn btn-soft btn-square btn-lg" disabled>
            <PresentationIcon />
        </button>
        <button type="button" class="btn btn-soft btn-square btn-lg" disabled>
            <HeartIcon />
        </button>
    </div>
</template>
