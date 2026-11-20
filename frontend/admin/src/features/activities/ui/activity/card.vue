<!-- A card in a list. The whole card opens the activity; its buttons sit above the link. -->
<script setup lang="ts">
import { Badge } from '@chapelure/ui/shadcn/badge';
import { Button } from '@chapelure/ui/shadcn/button';
import { Card, CardContent, CardFooter, CardTitle } from '@chapelure/ui/shadcn/card';
import { timingOf, type ActivityData } from '@features/activities/models/activity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import FavoriteButton from '@features/activities/ui/activity/_parts/favorite.vue';
import { computed } from 'vue';

const props = defineProps<{
    activity: ActivityData;
}>();

const timing = computed(() => timingOf(props.activity));
</script>

<template>
    <Card class="relative h-64 gap-2 overflow-hidden py-0">
        <figure class="min-h-0 flex-1 px-4 pt-4">
            <img src="https://placeholder.pagebee.io/api/plain/256/256"
                 alt=""
                 class="size-full object-cover rounded-xl" />
        </figure>
        <CardContent class="px-2 text-center">
            <CardTitle class="leading-snug">
                <RouterLink :to="{ name: activitiesRoutesNames.activity, params: { id: activity.id } }"
                            class="after:absolute after:inset-0">
                    {{ activity.name }}
                </RouterLink>
            </CardTitle>
        </CardContent>
        <CardFooter class="relative justify-between px-2 pb-2">
            <Badge variant="secondary">{{ $t('activities.minutes', { minutes: timing.total }) }}</Badge>
            <Button as-child variant="ghost" size="icon" class="rounded-full">
                <FavoriteButton :activity="activity" />
            </Button>
        </CardFooter>
    </Card>
</template>
