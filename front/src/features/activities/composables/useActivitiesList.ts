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

/** The criterion whose choices are loaded rather than declared. */
const BENEFITS_CRITERION = 'benefits';

/**
 * What the activity list can be narrowed by, in the order the form shows them.
 *
 * This list *is* the screen's filters: `@chapelure/ui/filter` generates the modal's fields and
 * the chips above the list from it, and `buildActivityFilters` turns it into a query — so a new
 * filter is a new entry here. What each criterion means to the backend travels with it:
 * `ageMin`/`ageMax` are two fields bounding one number, duration is one field bounded twice, and
 * benefits are matched with `anyEquals` because they are a relation list.
 *
 * It lives beside the call that sends the query rather than in `model/`, which may not import
 * the view layer — and a criterion carries its label, its input and its icon. See
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
 * Turn the criteria and the free-text search into the query sent to the backend.
 *
 * Empty criteria are stripped, so an untouched form produces an empty group and the list falls
 * back to showing everything. The search spans name and description, matching either.
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
 * The public activity list: what is on it, and what narrows it.
 *
 * Read-only. Writing an activity — and the button that starts one — is the `activities-edit`
 * feature's, which lists the author's own rather than everybody's.
 *
 * One composable for one screen. The criteria used to live in `<ActivitiesFilters>`, which
 * handed a built `FilterGroup` back up through `v-model` for the page to re-query with — the
 * query made a round trip for no reason. It is built here now, next to the call that sends it,
 * and the component is handed `filters` to render.
 */
export function useActivitiesList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        new Paginated<ActivityData>([], 0, new PaginationOptions(1, perPage)),
    );

    // Applied and draft criteria, and what moves one to the other, are the same on any screen
    // that filters; what is this screen's is the list handed in and the query built from it.
    const filters = useFilters(activityCriteria(), () => { refresh(); });

    /**
     * Re-query with the applied criteria and the current page.
     *
     * Empty criteria build an empty group, which the adapter sends as no filter at all — so the
     * first load and a filtered one take the same path, and there is no separate "unfiltered"
     * branch that could drift from the other.
     */
    async function refresh() {
        paginated.value = await activities.filter(
            buildActivityFilters(filters.applied.value, filters.search.value),
            paginated.value.options,
        );
    }

    onMounted(async () => {
        // Benefits are the one criterion whose choices are records rather than a fixed set.
        const choices = (await benefits.getAll()).map(benefit => ({ label: benefit.name, value: benefit.id }));
        filters.setChoices(BENEFITS_CRITERION, choices);

        await refresh();
    });

    return { paginated, refresh, filters };
}
