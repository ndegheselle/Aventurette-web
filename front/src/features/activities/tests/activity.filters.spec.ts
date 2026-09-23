import { FilterOperator, type Filter, type FilterGroup } from '@chapelure/core';
import type { Criterion } from '@chapelure/ui/filter/criteria';
import {
    activityCriteria,
    buildActivityFilters,
    criterionFilters,
    referentialChoices,
} from '@features/activities/composables/useActivitiesList';
import { aReferential } from '@tests';
import { describe, expect, it } from 'vitest';

// The criteria-to-query translation. Every criterion now names a column or a relation of
// `activities`, so the whole form is one query — the interesting part is what a *range* asks
// for, which is an overlap and not a containment.

/** The filters a group holds, flattened out of whatever nesting it uses. */
function leaves<T>(group: FilterGroup<T>): Filter<T>[] {
    return group.filters.flatMap(
        filter => 'filters' in filter ? leaves(filter as FilterGroup<T>) : [filter as Filter<T>],
    );
}

/** The declared criteria, with some of them set as the form would leave them. */
function criteria(values: Record<string, any> = {}): Criterion[] {
    return activityCriteria().map(criterion => criterion.key in values
        ? { ...criterion, value: values[criterion.key] } as Criterion
        : criterion);
}

const criterion = (key: string) => activityCriteria().find(c => c.key === key)!;

describe('activityCriteria', () => {
    it('offers a criterion per column and relation an activity can be narrowed by', () => {
        expect(criteria().map(c => c.key)).toEqual([
            'environnement', 'age', 'participants', 'hosts',
            'fields', 'imaginary', 'season', 'weather', 'energy_level', 'security',
            'develop_physical', 'develop_intellectual', 'develop_affect',
            'develop_social', 'develop_moral', 'develop_spritual',
        ]);
    });

    it('picks the input from what the column holds: a bounded number, a fixed set, a referential', () => {
        expect(criterion('age').type).toBe('range');
        expect(criterion('season').type).toBe('options');
        expect(criterion('fields').type).toBe('tags');
    });

    it('labels a stored value with a key of its own, there being no wording to show', () => {
        expect((criterion('energy_level') as any).choices)
            .toEqual([
                { label: 'activities.energy_level.LOW', value: 'LOW' },
                { label: 'activities.energy_level.MEDIUM', value: 'MEDIUM' },
                { label: 'activities.energy_level.HIGH', value: 'HIGH' },
            ]);
    });

    it('leaves a referential with nothing to offer until its rows arrive', () => {
        expect((criterion('fields') as any).choices).toEqual([]);
    });
});

describe('criterionFilters', () => {
    it('matches a range by overlap, so an activity whose range ends on the bound still counts', () => {
        // A 6-10 activity answers "for a 10 year old": the stored max is compared against the
        // asked min, and inclusively.
        const filters = criterionFilters({ ...criterion('age'), value: { min: 6, max: 10 } } as Criterion);

        expect(filters.map(filter => [filter.key, filter.value, filter.operator])).toEqual([
            ['age_max', 6, FilterOperator.GreaterOrEquals],
            ['age_min', 10, FilterOperator.LessOrEquals],
        ]);
    });

    it('bounds a single column from both ends when it is declared as both fields', () => {
        const filters = criterionFilters({ ...criterion('hosts'), value: { min: 2, max: 4 } } as Criterion);

        expect(filters.map(filter => [filter.key, filter.operator])).toEqual([
            ['recommended_hosts_numbers', FilterOperator.GreaterOrEquals],
            ['recommended_hosts_numbers', FilterOperator.LessOrEquals],
        ]);
    });

    it('matches a pick against its own field, any of the values doing', () => {
        const [filter] = criterionFilters({ ...criterion('fields'), value: ['fld-1', 'fld-2'] } as Criterion);

        expect([filter!.key, filter!.value, filter!.operator])
            .toEqual(['fields', ['fld-1', 'fld-2'], FilterOperator.AnyEquals]);
    });

    it('copies the values in, so editing the criterion cannot mutate a query already sent', () => {
        const picked = { ...criterion('security'), value: ['sec-1'] } as Criterion;
        const [filter] = criterionFilters(picked);

        (picked as any).value.push('sec-2');

        expect(filter!.value).toEqual(['sec-1']);
    });
});

describe('buildActivityFilters', () => {
    it('is empty for untouched criteria, so the list shows everything', () => {
        expect(leaves(buildActivityFilters(criteria(), ''))).toEqual([]);
    });

    it('drops the bound the user left open rather than comparing against nothing', () => {
        const group = buildActivityFilters(criteria({ age: { min: 6, max: null } }), '');

        expect(leaves(group).map(filter => filter.key)).toEqual(['age_max']);
    });

    it('searches name and description, either of which may match', () => {
        const group = buildActivityFilters(criteria(), 'hunt');

        expect(leaves(group).map(filter => filter.key)).toEqual(['name', 'description']);
    });

    it('keeps the search in a group of its own, so its ORs cannot widen the other criteria', () => {
        const group = buildActivityFilters(criteria({ season: ['WINTER'] }), 'hunt');

        expect(group.filters.filter(filter => !('filters' in filter))).toHaveLength(1);
        expect(group.filters.filter(filter => 'filters' in filter)).toHaveLength(1);
    });

    it('asks for every set criterion at once — one query answers the whole form', () => {
        const group = buildActivityFilters(criteria({
            age: { min: 6, max: null },
            season: ['WINTER'],
            fields: ['fld-1'],
        }), '');

        expect(leaves(group).map(filter => filter.key)).toEqual(['age_max', 'fields', 'season']);
    });
});

describe('referentialChoices', () => {
    it('labels a row with its wording in the locale on screen', () => {
        const rows = { fields: [aReferential({ name: { fr: 'art', en: 'art' } })] } as any;

        expect(referentialChoices(rows, 'en').fields)
            .toEqual([{ label: 'art', value: rows.fields[0].id }]);
    });

    it('falls back to French for a locale the row was never translated into', () => {
        const rows = { fields: [aReferential({ name: { fr: 'ingénierie' } })] } as any;

        expect(referentialChoices(rows, 'en').fields![0]!.label).toBe('ingénierie');
    });
});
