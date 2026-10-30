<script setup lang="ts">
import InfiniteScroll from '@chapelure/ui/data/InfiniteScroll.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useCatalogueFilters } from '@features/activities/composables/useCatalogueFilters';
import { useLibraryFeed } from '@features/activities/composables/useLibraryFeed';
import { isQuickFilterSet, QUICK_FILTERS, quickFilterLabel } from '@features/activities/models/catalogueFilters';
import ActivityCard from '@features/activities/ui/activity/card.vue';
import LibraryFilters from '@features/activities/ui/library/filters.vue';
import PickBanner from '@features/planning/ui/PickBanner.vue';
import { ChevronDownIcon, FunnelIcon } from 'lucide-vue-next';

const { items, loading, done, loadMore } = useLibraryFeed();
const {
    search, applied, draft, activeCount, draftCount,
    allSheet, quickSheet, quickShown, openAll, openQuick, reset,
    hasProfile, profileApplied,
} = useCatalogueFilters();
</script>

<template>
    <div class="flex flex-col gap-2 mx-2 mb-2">
        <SearchInput v-model="search" />

        <!-- The full filters' button, then the quick ones on a line that scrolls sideways. -->
        <!-- The padding keeps the count's indicator inside the line, which clips what overflows it. -->
        <div class="flex gap-2 pt-1">
            <div class="indicator shrink-0">
                <span v-if="activeCount"
                      class="indicator-item badge badge-primary badge-xs">{{ activeCount }}</span>
                <button type="button"
                        class="btn btn-square"
                        :aria-label="$t('activities.filters.open')"
                        @click="openAll">
                    <FunnelIcon />
                </button>
            </div>

            <div class="flex gap-2 overflow-x-auto scrollbar-none">
                <button v-for="quick in QUICK_FILTERS"
                        :key="quick"
                        type="button"
                        class="btn btn-soft"
                        :class="isQuickFilterSet(applied, quick) ? 'badge-primary' : 'badge-outline'"
                        @click="() => openQuick(quick)">
                    {{ $t(quickFilterLabel(applied, quick).key, quickFilterLabel(applied, quick).params) }}
                    <ChevronDownIcon class="size-4" />
                </button>
            </div>
        </div>

        <div class="empty:hidden">
            <PickBanner />
        </div>
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

    <!-- Every filter, the quick ones included. -->
    <ResponsiveModal :controller="allSheet"
                     height="full">
        <template #title>
            {{ $t('activities.filters.title') }}
            <span v-if="draftCount"
                  class="badge badge-primary">{{ draftCount }}</span>
        </template>
        <div class="flex flex-col gap-4">
            <label class="label justify-between rounded-box bg-base-200 p-3 text-base-content">
                <span class="flex flex-col">
                    <span class="font-semibold">{{ $t('activities.filters.profile.title') }}</span>
                    <span class="text-sm opacity-70 whitespace-normal">
                        {{ $t(hasProfile ? 'activities.filters.profile.help' : 'activities.filters.profile.empty') }}
                    </span>
                </span>
                <input type="checkbox"
                       class="toggle toggle-primary"
                       :disabled="!hasProfile"
                       v-model="profileApplied" />
            </label>

            <LibraryFilters v-model="draft" />

            <div class="sticky bottom-0 grid grid-cols-2 gap-2">

                <button type="button"
                        class="btn"
                        :disabled="!draftCount"
                        @click="reset">
                    {{ $t('activities.filters.reset') }}
                </button>

                <button type="button"
                        class="btn btn-primary"
                        @click="() => allSheet.confirm(true)">
                    {{ $t('activities.filters.apply') }}
                </button>
            </div>
        </div>
    </ResponsiveModal>

    <!-- One quick filter's values alone. -->
    <ResponsiveModal :controller="quickSheet">
        <template #title>
            <template v-if="quickShown">{{ $t(`activities.filters.quick.${quickShown}`) }}</template>
        </template>
        <div v-if="quickShown"
             class="flex flex-col gap-4">
            <LibraryFilters v-model="draft"
                            :only="quickShown" />

            <button type="button"
                    class="btn btn-primary btn-block"
                    @click="() => quickSheet.confirm(true)">
                {{ $t('activities.filters.apply') }}
            </button>
        </div>
    </ResponsiveModal>
</template>
