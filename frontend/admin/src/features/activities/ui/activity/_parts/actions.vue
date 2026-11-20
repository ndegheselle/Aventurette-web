<!-- The activity's actions: play it, present it, keep it, plan it. -->
<script setup lang="ts">
import { Button } from '@chapelure/ui/shadcn/button';
import type { ActivityData } from '@features/activities/models/activity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import FavoriteButton from '@features/activities/ui/activity/_parts/favorite.vue';
import PlanButton from '@features/planning/ui/PlanButton.vue';
import { PlayIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();
</script>

<template>
    <div class="flex gap-4">
        <Button as-child size="icon-lg">
            <RouterLink :aria-label="$t('activities.actions.start')"
                        :to="{ name: activitiesRoutesNames.play, params: { id: activity.id } }">
                <PlayIcon />
            </RouterLink>
        </Button>
        <Button as-child variant="outline" size="icon-lg">
            <FavoriteButton :activity="activity" />
        </Button>
        <!-- Given its look rather than wrapped: it changes its own while the planning is picking. -->
        <PlanButton :activity="activity" variant="outline" size="icon-lg" />
    </div>
</template>
