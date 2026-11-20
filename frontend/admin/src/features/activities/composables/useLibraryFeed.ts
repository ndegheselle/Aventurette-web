import { catalogueApi } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/models/activity';
import type { CatalogueFilters } from '@features/activities/models/catalogueFilters';
import { computed, ref, watch, type Ref } from 'vue';

export const LIBRARY_PAGE_SIZE = 12;

/**
 * The library's endless list: each `loadMore` appends the next page of activities matching the
 * search and filters, until the backend has no more to give. Changing either starts the list
 * over, and a page asked for before the change is dropped when it comes back. A page that fails
 * ends the list until the query changes: the scroll would otherwise ask again at once, forever.
 */
export function useLibraryFeed(filters: Ref<CatalogueFilters>, search: Ref<string>) {
    const items = ref<ActivityData[]>([]);
    const total = ref<number | null>(null);
    const loading = ref(false);
    const failed = ref(false);
    let page = 0;
    /** Which query the list is for: a page for an older one is not appended. */
    let query = 0;

    const done = computed(() => failed.value || (total.value !== null && items.value.length >= total.value));
    /** The backend answered, and nothing matches: not the same as a page that failed. */
    const empty = computed(() => total.value === 0);

    async function loadMore() {
        if (loading.value || done.value) return;
        const asked = query;
        loading.value = true;
        try {
            const next = await catalogueApi.page(filters.value, search.value,
                { page: page + 1, perPage: LIBRARY_PAGE_SIZE });
            if (asked !== query) return;
            page += 1;
            total.value = next.total;
            items.value = [...items.value, ...next.items];
        } catch (error) {
            if (asked === query) failed.value = true;
            throw error;
        } finally {
            if (asked === query) loading.value = false;
        }
    }

    function restart() {
        query += 1;
        page = 0;
        total.value = null;
        failed.value = false;
        items.value = [];
        loading.value = false;
        void loadMore();
    }

    watch([filters, search], restart, { deep: true });

    return { items, loading, done, empty, loadMore };
}
