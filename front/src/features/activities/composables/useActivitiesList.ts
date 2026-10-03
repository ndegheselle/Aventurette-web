import { createSearchFilter, type Paginated } from '@chapelure/core';
import { rangeLabel } from '@chapelure/ui/inputs/range';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { ageRangeOf, totalMinutesOf, type ActivityData } from '@features/activities/model/activity';
import { computed, onMounted, ref } from 'vue';

// One of <Pagination>'s page sizes, or its selector shows blank.
const DEFAULT_PER_PAGE = 25;

/**
 * The public activity list. Read-only — writing an activity is the `activities-authoring`
 * feature's, which lists the author's own rather than everybody's.
 */
export function useActivitiesList() {
    const paginated = ref<Paginated<ActivityData>>(
        { items: [], total: 0, options: { page: 1, perPage: DEFAULT_PER_PAGE } },
    );
    const search = ref<string>('');

    /** Re-query the current page. */
    async function refresh() {
        paginated.value = await activities.filter(
            createSearchFilter(search.value, ["name", "description"]),
            paginated.value.options,
        );
    }

    /** What each card shows beside the activity: the ages it is for and how long it takes. */
    const cards = computed(() => paginated.value.items.map(activity => {
        const ages = ageRangeOf(activity.audience);
        return { activity, ageLabel: rangeLabel(ages.min, ages.max), totalMinutes: totalMinutesOf(activity) };
    }));

    onMounted(refresh);

    return { paginated, cards, search, refresh };
}
