<script setup lang="ts">
import { Spinner } from '@chapelure/ui/shadcn/spinner';
import { useFavorites } from '@features/activities/composables/useFavorites';
import ActivityCard from '@features/activities/ui/activity/card.vue';
import { HeartIcon } from 'lucide-vue-next';

const { favorites, loading } = useFavorites();
</script>

<template>
    <div v-if="loading && favorites.length === 0" class="flex justify-center p-8">
        <Spinner class="size-6" />
    </div>

    <div v-else-if="favorites.length === 0" class="flex my-auto flex-col items-center gap-2 p-8 text-center text-muted-foreground">
        <HeartIcon class="size-10" />
        <p>{{ $t('activities.library.favoritesEmpty') }}</p>
    </div>

    <!-- In the order they were added. -->
    <div v-else class="grid lg:grid-cols-6 grid-cols-2 gap-2 mx-2 mb-2">
        <ActivityCard v-for="activity in favorites"
                      :key="activity.id"
                      :activity="activity" />
    </div>
</template>
