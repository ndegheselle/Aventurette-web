import {
    createFilter,
    createGroup,
    createSearchFilter,
    FilterOperator,
    removeEmptyFilters,
    type FilterGroup,
} from "@chapelure/core";
import type { ActivityData } from "@features/activities/model/activity";

/**
 * What the user has narrowed the activity list down to.
 *
 * Deliberately not a `FilterGroup`: this is the shape the form binds to — one field per input,
 * `null` for "not set" — and `buildActivityFilters` is the one place that turns it into a query.
 * Keeping the two apart is what lets the query be tested without a form, and the form without
 * a backend.
 */
export interface ActivityCriteria {
    ageMin: number | null;
    ageMax: number | null;
    durationMin: number | null;
    durationMax: number | null;
    environment: string[];
    benefits: string[];
}

/**
 * `null` rather than `0` for the numeric bounds: `removeEmptyFilters` drops falsy values, so a
 * `0` would be indistinguishable from an untouched field anyway.
 */
export function emptyCriteria(): ActivityCriteria {
    return {
        ageMin: null,
        ageMax: null,
        durationMin: null,
        durationMax: null,
        environment: [],
        benefits: [],
    };
}

/**
 * Whether anything is set that the toolbar does not already show on its own button.
 *
 * Age and environment have buttons that display their own value; duration and benefits do not,
 * so the filter button carries a badge when one of them is active. This is an indicator, not a
 * count — the badge has always read "1" for any number of them.
 */
export function hasAdvancedCriteria(criteria: ActivityCriteria): boolean {
    return Boolean(criteria.durationMin || criteria.durationMax || criteria.benefits.length);
}

/**
 * Turn the criteria and the free-text search into the query sent to the backend.
 *
 * Empty criteria are stripped, so an untouched form produces an empty group and the list falls
 * back to showing everything. The search spans name and description, matching either.
 */
export function buildActivityFilters(criteria: ActivityCriteria, search: string): FilterGroup<ActivityData> {
    const group = createGroup<ActivityData>({
        filters: [
            createFilter<ActivityData>({ key: 'ageMin', value: criteria.ageMin, operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'ageMax', value: criteria.ageMax, operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: criteria.durationMin, operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: criteria.durationMax, operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'environment', value: [...criteria.environment], operator: FilterOperator.Equals }),
            createFilter<ActivityData>({ key: 'benefits', value: [...criteria.benefits], operator: FilterOperator.AnyEquals }),
        ],
    });

    const searchFilter = createSearchFilter<ActivityData>(search, ['name', 'description']);
    if (searchFilter)
        group.filters.push(searchFilter);

    return removeEmptyFilters(group);
}
