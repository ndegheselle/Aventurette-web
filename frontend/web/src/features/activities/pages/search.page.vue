<script setup lang="ts">
import InfiniteScroll from '@chapelure/ui/data/InfiniteScroll.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useLibraryFeed } from '@features/activities/composables/useLibraryFeed';
import { ChevronRightIcon } from 'lucide-vue-next';

const { items, loading, done, loadMore } = useLibraryFeed();
</script>

<template>
    <Container>

        <div class="flex flex-col gap-2 sticky top-0 z-10 bg-base-100 p-2">
            <SearchInput />
            <div class="flex gap-2">
                <div class="flex-1 grid grid-cols-3 gap-2 opacity-50">
                    <div class="flex flex-col mx-auto">
                        <div class="skeleton h-16 w-16 shrink-0 rounded-full"></div>
                        <span class="text-sm text-center">{{ $t('activities.searchPage.quickFilters.age') }}</span>
                    </div>
                    <div class="flex flex-col mx-auto">
                        <div class="skeleton h-16 w-16 shrink-0 rounded-full"></div>
                        <span class="text-sm text-center">{{ $t('activities.searchPage.quickFilters.duration') }}</span>
                    </div>
                    <div class="flex flex-col mx-auto">
                        <div class="skeleton h-16 w-16 shrink-0 rounded-full"></div>
                        <span class="text-sm text-center">{{ $t('activities.searchPage.quickFilters.location') }}</span>
                    </div>
                </div>
                <button class="btn btn-circle btn-ghost my-auto" disabled>
                    <ChevronRightIcon />
                </button>
            </div>
        </div>

        <InfiniteScroll :loading="loading"
                        :done="done"
                        @load="loadMore">
            <div class="grid grid-cols-2 gap-2 mx-2">
                <div v-for="column in 2"
                     :key="column"
                     class="flex flex-col gap-2">
                    <div v-for="item in items.filter((i) => i % 2 === column - 1)"
                         :key="item"
                         class="skeleton w-full"
                         :class="column === 2 && item === 1 ? 'h-52' : 'h-64'"></div>
                </div>
            </div>
        </InfiniteScroll>
    </Container>
</template>
