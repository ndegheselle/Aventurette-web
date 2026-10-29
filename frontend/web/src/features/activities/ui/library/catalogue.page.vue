<script setup lang="ts">
import InfiniteScroll from '@chapelure/ui/data/InfiniteScroll.vue';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { useLibraryFeed } from '@features/activities/composables/useLibraryFeed';
import ActivityCard from '@features/activities/ui/activity/card.vue';
import LibraryFilters from '@features/activities/ui/library/filters.vue';
import PickBanner from '@features/planning/ui/PickBanner.vue';
import { FunnelIcon } from 'lucide-vue-next';

const { items, loading, done, loadMore } = useLibraryFeed();
const filtersSheet = useModal();
</script>

<template>
    <div class="mx-2 mb-2 empty:hidden">
        <PickBanner />
    </div>

    <!-- Two columns, the second one's first card shorter so the cards do not line up. -->
    <InfiniteScroll :loading="loading"
                    :done="done"
                    @load="loadMore">
        <div class="grid lg:grid-cols-6 grid-cols-2 gap-2 mx-2 mb-2">
            <ActivityCard v-for="activity in items"
                          :key="activity.id"
                          :activity="activity" />
        </div>
    </InfiniteScroll>

    <div class="sticky bottom-14 flex justify-end p-2">
        <div class="indicator">
            <span class="indicator-item indicator-start badge badge-primary">3</span>
            <button type="button"
                    class="btn btn-square btn-lg"
                    :aria-label="$t('activities.filters.open')"
                    @click="() => filtersSheet.show()">
                <FunnelIcon />
            </button>
        </div>

    </div>

    <ResponsiveModal :controller="filtersSheet"
                     height="expandable">
        <template #title>{{ $t('activities.filters.title') }}
            <div class="badge badge-primary">3</div>
        </template>
        <template #action>
            <button type="button"
                    class="btn btn-sm btn-ghost"
                    disabled>
                {{ $t('activities.filters.reset') }}
            </button>
        </template>
        <template #default="{ expanded }">
            <LibraryFilters :expanded="expanded" />
        </template>
    </ResponsiveModal>
</template>
