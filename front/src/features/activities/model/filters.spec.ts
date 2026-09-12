import { isFilterGroup, type Filter } from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import type { ActivityData } from './activity';
import {
    buildActivityFilters,
    emptyCriteria,
    hasAdvancedCriteria,
    type ActivityCriteria,
} from './filters';

/** The leaf filters of a group, ignoring nesting, keyed by field. */
function leaves(group: ReturnType<typeof buildActivityFilters>): Filter<ActivityData>[] {
    return group.filters.flatMap(f => (isFilterGroup(f) ? leaves(f) : [f]));
}

function criteria(overrides: Partial<ActivityCriteria> = {}): ActivityCriteria {
    return { ...emptyCriteria(), ...overrides };
}

describe('buildActivityFilters', () => {
    it('is empty when nothing is set, so the list shows everything', () => {
        expect(buildActivityFilters(emptyCriteria(), '').filters).toEqual([]);
    });

    it('sends age bounds as a range around the activity\'s own bounds', () => {
        const group = buildActivityFilters(criteria({ ageMin: 6, ageMax: 10 }), '');

        expect(leaves(group)).toEqual([
            expect.objectContaining({ key: 'ageMin', value: 6, operator: 'greaterThan' }),
            expect.objectContaining({ key: 'ageMax', value: 10, operator: 'lessThan' }),
        ]);
    });

    it('sends both duration bounds against the same field', () => {
        const group = buildActivityFilters(criteria({ durationMin: 15, durationMax: 60 }), '');

        expect(leaves(group).map(f => [f.key, f.operator, f.value])).toEqual([
            ['durationMinutes', 'greaterThan', 15],
            ['durationMinutes', 'lessThan', 60],
        ]);
    });

    it('matches any of the selected environments', () => {
        const group = buildActivityFilters(criteria({ environment: ['INDOOR', 'CAR'] }), '');

        expect(leaves(group)).toEqual([
            expect.objectContaining({ key: 'environment', value: ['INDOOR', 'CAR'], operator: 'equals' }),
        ]);
    });

    it('matches benefits with the any-equals operator, since benefits is a relation list', () => {
        const group = buildActivityFilters(criteria({ benefits: ['bnf1'] }), '');

        expect(leaves(group)).toEqual([
            expect.objectContaining({ key: 'benefits', value: ['bnf1'], operator: 'anyEquals' }),
        ]);
    });

    it('searches name and description, either of which may match', () => {
        const group = buildActivityFilters(emptyCriteria(), 'hunt');

        const searchGroup = group.filters.find(isFilterGroup);
        expect(searchGroup && leaves(searchGroup).map(f => f.key)).toEqual(['name', 'description']);
        expect(searchGroup && leaves(searchGroup).every(f => f.combine === 'or')).toBe(true);
    });

    it('keeps the search as its own group, so its ORs do not widen the other criteria', () => {
        const group = buildActivityFilters(criteria({ ageMin: 6 }), 'hunt');

        expect(group.filters.filter(isFilterGroup)).toHaveLength(1);
        expect(group.filters.filter(f => !isFilterGroup(f))).toHaveLength(1);
    });

    it('drops criteria that are not set rather than sending empty ones', () => {
        const group = buildActivityFilters(criteria({ ageMin: 6, environment: [], benefits: [] }), '');

        expect(leaves(group)).toHaveLength(1);
    });

    it('copies the arrays, so later edits to the criteria cannot mutate a sent query', () => {
        const source = criteria({ environment: ['INDOOR'] });
        const group = buildActivityFilters(source, '');

        source.environment.push('CAR');

        expect(leaves(group)[0]!.value).toEqual(['INDOOR']);
    });

    it('takes number-typed bounds through unchanged', () => {
        // Guards the seam the form relies on. Note the inputs are `<input type="number">` bound
        // without `.number`, so what arrives here at runtime is a string — see the feature doc.
        const group = buildActivityFilters(criteria({ ageMin: 6 }), '');
        expect(leaves(group)[0]!.value).toBe(6);
    });
});

describe('hasAdvancedCriteria', () => {
    it('is false for empty criteria', () => {
        expect(hasAdvancedCriteria(emptyCriteria())).toBe(false);
    });

    it.each([
        ['a duration minimum', { durationMin: 15 }],
        ['a duration maximum', { durationMax: 60 }],
        ['a benefit', { benefits: ['bnf1'] }],
    ])('is true for %s, which no toolbar button displays', (_label, set) => {
        expect(hasAdvancedCriteria(criteria(set))).toBe(true);
    });

    it.each([
        ['age', { ageMin: 6, ageMax: 10 }],
        ['environment', { environment: ['INDOOR'] }],
    ])('is false for %s, which has its own button showing the value', (_label, set) => {
        expect(hasAdvancedCriteria(criteria(set))).toBe(false);
    });
});
