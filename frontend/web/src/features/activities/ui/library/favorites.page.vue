<script setup lang="ts">
import { useFavoritesList } from '@features/activities/composables/useFavoritesList';
import ActivityCard from '@features/activities/ui/activity/card.vue';
import { HeartIcon } from 'lucide-vue-next';

const { items, loading } = useFavoritesList();
</script>

<template>
    <!-- The spinner only before the first answer: a read again after a heart keeps the cards up. -->
    <div v-if="loading && items.length === 0" class="flex justify-center p-8">
        <span class="loading loading-spinner"></span>
    </div>

    <div v-else-if="items.length === 0" class="flex flex-col items-center gap-2 p-8 text-center opacity-70">
        <HeartIcon class="size-10" />
        <p>{{ $t('activities.library.favoritesEmpty') }}</p>
    </div>

    <div v-else class="grid lg:grid-cols-6 grid-cols-2 gap-2 mx-2 mb-2">
        <ActivityCard v-for="activity in items"
                      :key="activity.id"
                      :activity="activity" />
    </div>
</template>
