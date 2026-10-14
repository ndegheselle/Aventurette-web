<script setup lang="ts">
import InfiniteScroll from '@chapelure/ui/data/InfiniteScroll.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useLibraryFeed } from '@features/activities/composables/useLibraryFeed';

const { items, loading, done, loadMore } = useLibraryFeed();
</script>

<template>
    <Container>
        <!-- Sticky: the page scrolls, the tabs stay under the top edge. -->
        <div role="tablist" class="tabs tabs-border sticky top-0 z-10 bg-base-100 p-2">
            <a role="tab" class="tab tab-active">{{ $t('activities.library.tabs.catalogue') }}</a>
            <a role="tab" class="tab tab-disabled">{{ $t('activities.library.tabs.favorites') }}</a>
            <a role="tab" class="tab tab-disabled">{{ $t('activities.library.tabs.history') }}</a>
        </div>

        <!-- Two columns, the second one's first card shorter so the cards do not line up. -->
        <InfiniteScroll :loading="loading" :done="done" @load="loadMore">
            <div class="grid grid-cols-2 gap-2 mx-2">
                <div v-for="column in 2" :key="column" class="flex flex-col gap-2">
                    <div
                        v-for="item in items.filter((i) => i % 2 === column - 1)"
                        :key="item"
                        class="skeleton w-full"
                        :class="column === 2 && item === 1 ? 'h-52' : 'h-64'"
                    ></div>
                </div>
            </div>
        </InfiniteScroll>
    </Container>
</template>
