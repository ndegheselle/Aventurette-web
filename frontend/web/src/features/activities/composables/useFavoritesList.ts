import { createFilter, createGroup, FilterOperator, SortDirection } from '@chapelure/core';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/models/activity';
import { useFavorites } from '@features/user/composables/useFavorites';
import { ref, watch } from 'vue';

/**
 * The favorites tab: the signed-in user's favorite activities, by name. Read again whenever the
 * favorites change, so a heart tapped on the tab takes its card off, and cancelling puts it back.
 */
export function useFavoritesList() {
    const { favoriteIds } = useFavorites();
    const items = ref<ActivityData[]>([]);
    const loading = ref(false);

    async function fetchActivities(ids: string[]): Promise<ActivityData[]> {
        // An empty filter matches every activity: no favorites is no request.
        if (ids.length === 0) return [];

        const byId = createGroup<ActivityData>({
            filters: [createFilter({ key: 'id', value: ids, operator: FilterOperator.Equals })],
        });
        const found = await activities.filter(byId, {
            page: 1,
            perPage: ids.length,
            sortBy: 'name',
            sortDirection: SortDirection.ASC,
        });
        return found.items;
    }

    watch(favoriteIds, async (ids, _previous, onCleanup) => {
        // A change arriving while a read is in flight makes that read's answer out of date.
        let outdated = false;
        onCleanup(() => outdated = true);

        loading.value = true;
        try {
            const found = await fetchActivities(ids);
            if (!outdated) items.value = found;
        } finally {
            if (!outdated) loading.value = false;
        }
    }, { immediate: true });

    return { items, loading };
}
