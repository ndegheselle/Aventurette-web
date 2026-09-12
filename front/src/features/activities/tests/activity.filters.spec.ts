import { FilterOperator, type Filter, type FilterGroup } from '@chapelure/core';
import type { ActivityData } from '@features/activities/model/activity';
import {
    buildActivityFilters,
    emptyCriteria,
    hasAdvancedCriteria,
} from '@features/activities/model/activity.filters';
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

describe('buildActivityFilters', () => {
    it('is empty for untouched criteria, so the list shows everything', () => {
        expect(leaves(buildActivityFilters(emptyCriteria(), ''))).toEqual([]);
    });

    it('searches name and description, either of which may match', () => {
        const group = buildActivityFilters(emptyCriteria(), 'hunt');

        expect(leaves(group).map(filter => filter.key)).toEqual(['name', 'description']);
    });

    it('keeps the search in a group of its own, so its ORs cannot widen the other criteria', () => {
        const group = buildActivityFilters({ ...emptyCriteria(), ageMin: 6 }, 'hunt');

        // Age sits at the top level; the two search filters are nested one level down.
        expect(group.filters.filter(filter => !('filters' in filter))).toHaveLength(1);
        expect(group.filters.filter(filter => 'filters' in filter)).toHaveLength(1);
    });

    it('matches benefits with anyEquals, because it is a relation list', () => {
        const group = buildActivityFilters({ ...emptyCriteria(), benefits: ['bnf-1'] }, '');

        expect(onlyLeaf(group).operator).toBe(FilterOperator.AnyEquals);
    });

    it('bounds duration from both ends against the same field', () => {
        const criteria = { ...emptyCriteria(), durationMin: 10, durationMax: 30 };

        expect(leaves(buildActivityFilters(criteria, '')).map(filter => [filter.key, filter.operator])).toEqual([
            ['durationMinutes', FilterOperator.GreaterThan],
            ['durationMinutes', FilterOperator.LessThan],
        ]);
    });

    it('copies the arrays in, so editing the criteria cannot mutate a query already sent', () => {
        const criteria = { ...emptyCriteria(), environment: ['INDOOR'] };
        const group = buildActivityFilters(criteria, '');

        criteria.environment.push('OUTDOOR');

        expect(onlyLeaf(group).value).toEqual(['INDOOR']);
    });
});

describe('hasAdvancedCriteria', () => {
    it('ignores age and environment, which the toolbar shows on their own buttons', () => {
        const criteria = { ...emptyCriteria(), ageMin: 6, environment: ['INDOOR'] };

        expect(hasAdvancedCriteria(criteria)).toBe(false);
    });

    it('is set for duration and benefits, which nothing else displays', () => {
        expect(hasAdvancedCriteria({ ...emptyCriteria(), durationMin: 10 })).toBe(true);
        expect(hasAdvancedCriteria({ ...emptyCriteria(), benefits: ['bnf-1'] })).toBe(true);
    });
});
