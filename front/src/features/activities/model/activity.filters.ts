import {
    createGroup,
    createSearchFilter,
    FilterOperator,
    removeEmptyFilters,
    type FilterGroup,
} from "@chapelure/core";
import { availablesEnvironments, type ActivityData } from "@features/activities/model/activity";
import {
    criterionFilters,
    optionsCriterion,
    rangeCriterion,
    tagsCriterion,
    type Criterion,
} from "@features/activities/model/criteria";

/** The criterion whose choices are loaded rather than declared — see `useActivitiesList`. */
export const BENEFITS_CRITERION = 'benefits';

/**
 * What the activity list can be narrowed by, in the order the form shows them.
 *
 * This list *is* the filter feature: the modal's fields, the chips above the list and the query
 * are all generated from it, so a new filter is a new entry here. What each criterion means to
 * the backend travels with it — `ageMin`/`ageMax` are two fields bounding one number, duration
 * is one field bounded twice, and benefits are matched with `anyEquals` because they are a
 * relation list.
 */
export function activityCriteria(): Criterion[] {
    return [
        rangeCriterion({
            key: 'age',
            label: 'activities.fields.age',
            display: 'activities.age',
            minField: 'ageMin',
            maxField: 'ageMax',
        }),
        rangeCriterion({
            key: 'duration',
            label: 'activities.fields.durationMinutes',
            display: 'activities.durationRange',
            minField: 'durationMinutes',
            maxField: 'durationMinutes',
        }),
        optionsCriterion({
            key: 'environment',
            label: 'activities.fields.environment',
            field: 'environment',
            operator: FilterOperator.Equals,
            choices: availablesEnvironments,
        }),
        tagsCriterion({
            key: BENEFITS_CRITERION,
            label: 'activities.fields.benefits',
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
