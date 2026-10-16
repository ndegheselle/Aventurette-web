<!-- A card in a list. The whole card opens the activity; its buttons sit above the link. -->
<script setup lang="ts">
import { timingOf, type ActivityData } from '@features/activities/models/activity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { HeartIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{
    activity: ActivityData;
}>();

const timing = computed(() => timingOf(props.activity));
</script>

<template>
    <div class="card bg-base-100 shadow-sm h-64 relative border border-base-200">
        <figure class="px-4 pt-4">
            <img src="https://placeholder.pagebee.io/api/plain/256/256"
                 alt=""
                 class="size-full object-cover rounded-box" />
        </figure>
        <div class="card-body items-center text-center p-2">
            <h2 class="card-title">
                <RouterLink :to="{ name: activitiesRoutesNames.activity, params: { id: activity.id } }"
                            class="after:absolute after:inset-0">
                    {{ activity.name }}
                </RouterLink>
            </h2>
            <div class="card-actions relative justify-between">
                <span class="badge my-auto">{{ $t('activities.minutes', { minutes: timing.total }) }}</span>
                <button class="btn btn-ghost btn-circle"
                        :aria-label="$t('activities.card.more')"
                        disabled>
                    <HeartIcon />
                </button>
            </div>
        </div>
    </div>
</template>
