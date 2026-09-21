import {
    createGroup,
    createSearchFilter,
    Paginated,
    PaginationOptions,
    removeEmptyFilters,
    type FilterGroup,
} from '@chapelure/core';
import { useFilters } from '@chapelure/ui/filter/useFilters';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/model/activity';
import { onMounted, ref } from 'vue';

const DEFAULT_PER_PAGE = 5;

/**
 * The query the list sends: the search, and nothing else yet — the columns an activity is
 * narrowed by have no criteria behind them.
 */
export function buildActivityFilters(search: string): FilterGroup<ActivityData> {
    const group = createGroup<ActivityData>({ filters: [] });

    const searchFilter = createSearchFilter<ActivityData>(search, ['name', 'description']);
    if (searchFilter)
        group.filters.push(searchFilter);

    return removeEmptyFilters(group);
}

/**
 * The public activity list: what is on it, and what narrows it. Read-only — writing an activity
 * is the `activities-authoring` feature's, which lists the author's own rather than everybody's.
 */
export function useActivitiesList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        new Paginated<ActivityData>([], 0, new PaginationOptions(1, perPage)),
    );

    const filters = useFilters([], () => { refresh(); });

    /** Re-query with the current search and page. */
    async function refresh() {
        paginated.value = await activities.filter(
            buildActivityFilters(filters.search.value),
            paginated.value.options,
        );
    }

    onMounted(refresh);

    return { paginated, refresh, filters };
}
