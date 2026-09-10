import { createGroup, Paginated, PaginationOptions, type FilterGroup } from '@chapelure/core';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/model/activity';
import { onMounted, ref } from 'vue';

const DEFAULT_PER_PAGE = 5;

/**
 * The activity list: what is on screen, and what to ask for next.
 *
 * `filters` is handed to `<ActivitiesFilters>` as its model and to the backend as the query.
 * An empty group means no criteria, which the adapter sends as no filter at all — so the first
 * load and a filtered one take the same path, and there is no separate "unfiltered" branch that
 * could drift from the other.
 */
export function useActivitiesList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        new Paginated<ActivityData>([], 0, new PaginationOptions(1, perPage)),
    );

    // A ref, not a reactive: `<ActivitiesFilters>` binds this with v-model and replaces the
    // whole group on every change, which a reactive object cannot be the target of.
    const filters = ref<FilterGroup<ActivityData>>(createGroup<ActivityData>({}));

    /** Re-query with the current filters and page. */
    async function refresh() {
        paginated.value = await activities.filter(filters.value, paginated.value.options);
    }

    onMounted(refresh);

    return { paginated, filters, refresh };
}
