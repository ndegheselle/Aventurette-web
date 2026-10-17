<script setup lang="ts">
import InfiniteScroll from '@chapelure/ui/data/InfiniteScroll.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useLibraryFeed } from '@features/activities/composables/useLibraryFeed';
import ActivityCard from '@features/activities/ui/activity/card.vue';
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
                <div 
                     class="grid grid-cols-2 gap-2 mx-2 mb-2">
                     <ActivityCard v-for="activity in items"
                                   :key="activity.id"
                                   :activity="activity" />
                </div>
        </InfiniteScroll>
    </Container>
</template>
