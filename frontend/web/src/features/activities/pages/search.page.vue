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
                        <img class="mask mask-circle" src="https://placeholder.pagebee.io/api/plain/64/64" />
                        <span class="text-sm text-center">{{ $t('activities.searchPage.quickFilters.age') }}</span>
                    </div>
                    <div class="flex flex-col mx-auto">
                        <img class="mask mask-circle" src="https://placeholder.pagebee.io/api/plain/64/64" />
                        <span class="text-sm text-center">{{ $t('activities.searchPage.quickFilters.duration') }}</span>
                    </div>
                    <div class="flex flex-col mx-auto">
                        <img class="mask mask-circle" src="https://placeholder.pagebee.io/api/plain/64/64" />
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
                     <img  v-for="item in items.filter((i) => i % 2 === column - 1)"
                         :key="item"
                         class="rounded-box w-full object-cover"
                         :class="column === 2 && item === 1 ? 'h-52' : 'h-64'" src="https://placeholder.pagebee.io/api/plain/256/512" />
                </div>
            </div>
        </InfiniteScroll>
    </Container>
</template>
