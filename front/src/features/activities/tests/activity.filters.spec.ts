import { FilterOperator, type Filter, type FilterGroup } from '@chapelure/core';
import type { ActivityData } from '@features/activities/model/activity';
import { activityCriteria, buildActivityFilters } from '@features/activities/model/activity.filters';
import type { Criterion, RangeValue } from '@features/activities/model/criteria';
import { describe, expect, it } from 'vitest';

/** The filters a group holds, flattened out of whatever nesting it uses. */
function leaves(group: FilterGroup<ActivityData>): Filter<ActivityData>[] {
    return group.filters.flatMap(
        filter => 'filters' in filter ? leaves(filter as FilterGroup<ActivityData>) : [filter as Filter<ActivityData>],
    );
}

/** The single filter the criteria under test produced. */
function onlyLeaf(group: FilterGroup<ActivityData>): Filter<ActivityData> {
    const found = leaves(group);
    expect(found).toHaveLength(1);
    return found[0]!;
}

/** The activity's criteria with some of them set, as the form would have left them. */
function criteria(values: Record<string, RangeValue | string[]> = {}): Criterion[] {
    return activityCriteria().map(criterion => criterion.key in values
        ? { ...criterion, value: values[criterion.key] } as Criterion
        : criterion);
}

describe('buildActivityFilters', () => {
    it('is empty for untouched criteria, so the list shows everything', () => {
        expect(leaves(buildActivityFilters(criteria(), ''))).toEqual([]);
    });

    it('searches name and description, either of which may match', () => {
        const group = buildActivityFilters(criteria(), 'hunt');

        expect(leaves(group).map(filter => filter.key)).toEqual(['name', 'description']);
    });

    it('keeps the search in a group of its own, so its ORs cannot widen the other criteria', () => {
        const group = buildActivityFilters(criteria({ age: { min: 6, max: null } }), 'hunt');

        // Age sits at the top level; the two search filters are nested one level down.
        expect(group.filters.filter(filter => !('filters' in filter))).toHaveLength(1);
        expect(group.filters.filter(filter => 'filters' in filter)).toHaveLength(1);
    });

    it('matches benefits with anyEquals, because it is a relation list', () => {
        const group = buildActivityFilters(criteria({ benefits: ['bnf-1'] }), '');

        expect(onlyLeaf(group).operator).toBe(FilterOperator.AnyEquals);
    });

    it('bounds age against its two fields, and duration twice against its one', () => {
        const group = buildActivityFilters(criteria({
            age: { min: 6, max: 10 },
            duration: { min: 10, max: 30 },
        }), '');

        expect(leaves(group).map(filter => [filter.key, filter.operator])).toEqual([
            ['ageMin', FilterOperator.GreaterThan],
            ['ageMax', FilterOperator.LessThan],
            ['durationMinutes', FilterOperator.GreaterThan],
            ['durationMinutes', FilterOperator.LessThan],
        ]);
    });
});
