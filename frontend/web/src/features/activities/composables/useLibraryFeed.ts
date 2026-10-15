import { createSearchFilter } from '@chapelure/core';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/models/activity';
import { computed, ref } from 'vue';

export const LIBRARY_PAGE_SIZE = 12;

/**
 * The library's endless list: each `loadMore` appends the next page of activities, until the
 * backend has no more to give.
 */
export function useLibraryFeed() {
    const items = ref<ActivityData[]>([]);
    const total = ref<number | null>(null);
    const loading = ref(false);
    let page = 0;

    const done = computed(() => total.value !== null && items.value.length >= total.value);

    async function loadMore() {
        if (loading.value || done.value) return;
        loading.value = true;
        try {
            const next = await activities.filter(
                createSearchFilter('', ['name', 'description']),
                { page: page + 1, perPage: LIBRARY_PAGE_SIZE },
            );
            page += 1;
            total.value = next.total;
            items.value = [...items.value, ...next.items];
        } finally {
            loading.value = false;
        }
    }

    return { items, loading, done, loadMore };
}
