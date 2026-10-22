<!-- The activity's actions: play it, present it, keep it, plan it. -->
<script setup lang="ts">
import type { ActivityData } from '@features/activities/models/activity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import FavoriteButton from '@features/activities/ui/activity/_parts/favorite.vue';
import PlanButton from '@features/planning/ui/PlanButton.vue';
import { PlayIcon, PresentationIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();
</script>

<template>
    <div class="flex gap-4">
        <RouterLink class="btn btn-square btn-primary btn-lg" :aria-label="$t('activities.actions.start')"
                    :to="{ name: activitiesRoutesNames.play, params: { id: activity.id } }">
            <PlayIcon />
        </RouterLink>
        <button type="button" class="btn btn-square btn-lg" disabled>
            <PresentationIcon />
        </button>
        <FavoriteButton :activity="activity" class="btn btn-square btn-lg" />
        <PlanButton :activity="activity" class="btn btn-square btn-lg" />
    </div>
</template>
