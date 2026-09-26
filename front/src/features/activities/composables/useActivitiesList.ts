import { createSearchFilter, type Paginated } from '@chapelure/core';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/model/activity';
import { onMounted, ref } from 'vue';

// One of <Pagination>'s page sizes, or its selector shows blank.
const DEFAULT_PER_PAGE = 25;

/**
 * The public activity list. Read-only — writing an activity is the `activities-authoring`
 * feature's, which lists the author's own rather than everybody's.
 */
export function useActivitiesList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        { items: [], total: 0, options: { page: 1, perPage } },
    );
    const search = ref<string>('');

    /** Re-query the current page. */
    async function refresh() {
        paginated.value = await activities.filter(
            createSearchFilter(search.value, ["name", "description"]),
            paginated.value.options,
        );
    }

    onMounted(refresh);

    return { paginated, search, refresh };
}
