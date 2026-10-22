<script setup lang="ts">
import InfiniteScroll from '@chapelure/ui/data/InfiniteScroll.vue';
import { useLibraryFeed } from '@features/activities/composables/useLibraryFeed';

import ActivityCard from '@features/activities/ui/activity/card.vue';

const { items, loading, done, loadMore } = useLibraryFeed();
</script>

<template>
    <!-- Two columns, the second one's first card shorter so the cards do not line up. -->
    <InfiniteScroll :loading="loading" :done="done" @load="loadMore">
            <div 
                 class="grid lg:grid-cols-6 grid-cols-2 gap-2 mx-2 mb-2">
                 <ActivityCard v-for="activity in items"
                               :key="activity.id"
                               :activity="activity" />
            </div>
    </InfiniteScroll>
</template>
