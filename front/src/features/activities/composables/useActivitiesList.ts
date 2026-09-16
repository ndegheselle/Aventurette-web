import {
    createGroup,
    createSearchFilter,
    FilterOperator,
    Paginated,
    PaginationOptions,
    removeEmptyFilters,
    type FilterGroup,
} from '@chapelure/core';
import {
    criterionFilters,
    optionsCriterion,
    rangeCriterion,
    tagsCriterion,
    type Criterion,
} from '@chapelure/ui/filter/criteria';
import { useFilters } from '@chapelure/ui/filter/useFilters';
import { activitiesApi as activities, benefitsApi as benefits } from '@features/activities/api/activities.api';
import { availablesEnvironments, type ActivityData } from '@features/activities/model/activity';
import { BabyIcon, ClockIcon, MapIcon, TrendingUpIcon } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const DEFAULT_PER_PAGE = 5;

/** The one criterion whose choices are loaded rather than declared. */
const BENEFITS_CRITERION = 'benefits';

/**
 * What the activity list can be narrowed by, in the order the form shows them. The modal's
 * fields, the chips above the list and the query are all generated from this, so a new filter
 * is a new entry here.
 *
 * Each criterion carries what it means to the backend: `ageMin`/`ageMax` are two fields bounding
 * one number, duration is one field bounded twice, and benefits need `anyEquals` because they
 * are a relation list. See
 * [ADR 0016](../../../../../docs/adr/0016-filtering-lives-in-the-ui-package.md).
 */
export function activityCriteria(): Criterion[] {
    return [
        rangeCriterion({
            key: 'age',
            label: 'activities.fields.age',
            icon: BabyIcon,
            display: 'activities.age',
            minField: 'ageMin',
            maxField: 'ageMax',
        }),
        rangeCriterion({
            key: 'duration',
            label: 'activities.fields.durationMinutes',
            icon: ClockIcon,
            display: 'activities.durationRange',
            minField: 'durationMinutes',
            maxField: 'durationMinutes',
        }),
        optionsCriterion({
            key: 'environment',
            label: 'activities.fields.environment',
            icon: MapIcon,
            field: 'environment',
            operator: FilterOperator.Equals,
            choices: availablesEnvironments,
        }),
        tagsCriterion({
            key: BENEFITS_CRITERION,
            label: 'activities.fields.benefits',
            icon: TrendingUpIcon,
            field: 'benefits',
            operator: FilterOperator.AnyEquals,
        }),
    ];
}

/**
 * Turn the criteria and the free-text search into the query sent to the backend. Empty criteria
 * are stripped, so an untouched form shows everything. The search matches name or description.
 */
export function buildActivityFilters(criteria: Criterion[], search: string): FilterGroup<ActivityData> {
    const group = createGroup<ActivityData>({
        filters: criteria.flatMap(criterion => criterionFilters<ActivityData>(criterion)),
    });

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

    const filters = useFilters(activityCriteria(), () => { refresh(); });

    /** Re-query with the applied criteria and the current page. */
    async function refresh() {
        paginated.value = await activities.filter(
            buildActivityFilters(filters.applied.value, filters.search.value),
            paginated.value.options,
        );
    }

    onMounted(async () => {
        const choices = (await benefits.getAll()).map(benefit => ({ label: benefit.name, value: benefit.id }));
        filters.setChoices(BENEFITS_CRITERION, choices);

        await refresh();
    });

    return { paginated, refresh, filters };
}
