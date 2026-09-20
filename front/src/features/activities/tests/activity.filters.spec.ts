import { FilterOperator, type Filter, type FilterGroup } from '@chapelure/core';
import type { Criterion } from '@chapelure/ui/filter/criteria';
import {
    activityCriteria,
    buildActivityFilters,
    buildAttributeSweep,
} from '@features/activities/composables/useActivitiesList';
import { AttributeType, type AttributeData } from '@features/activities/model/attribute';
import { anAttribute, anOption } from '@tests';
import { describe, expect, it } from 'vitest';

// Two translations, and the split between them is the point: what the activity's own columns can
// answer goes in one query, what lives in the attribute rows goes in a sweep of its own.

const art = anOption({ label: 'art' });
const domain = anAttribute({ id: 'atr-dom', slug: 'domaine', type: AttributeType.multi_choice, options: [art] });
const energy = anAttribute({ id: 'atr-nrg', slug: 'niveau-energie', type: AttributeType.single_choice, options: [anOption({ label: 'Bas', value: '1' })] });
const age = anAttribute({ id: 'atr-age', slug: 'age', type: AttributeType.range });
const duration = anAttribute({ id: 'atr-dur', slug: 'temps-jeu', type: AttributeType.number });
const visual = anAttribute({ slug: 'visuel-principal', type: AttributeType.string });

const catalogue = [age, duration, domain, energy, visual];

/** The filters a group holds, flattened out of whatever nesting it uses. */
function leaves<T>(group: FilterGroup<T>): Filter<T>[] {
    return group.filters.flatMap(
        filter => 'filters' in filter ? leaves(filter as FilterGroup<T>) : [filter as Filter<T>],
    );
}

/** The criteria the catalogue generates, with some of them set as the form would leave them. */
function criteria(values: Record<string, any> = {}, attributes: AttributeData[] = catalogue): Criterion[] {
    return activityCriteria(attributes).map(criterion => criterion.key in values
        ? { ...criterion, value: values[criterion.key] } as Criterion
        : criterion);
}

describe('activityCriteria', () => {
    it('offers a criterion per filterable attribute, and skips the free text', () => {
        expect(criteria().map(criterion => criterion.key))
            .toEqual(['age', 'temps-jeu', 'domaine', 'niveau-energie']);
    });

    it('picks the input from the attribute type, and fills a vocabulary in', () => {
        const [ageCriterion, , domainCriterion, energyCriterion] = criteria();

        expect(ageCriterion!.type).toBe('range');
        expect(domainCriterion!.type).toBe('tags');
        expect(energyCriterion!.type).toBe('options');
        expect((domainCriterion as any).choices).toEqual([{ label: 'art', value: art.id }]);
    });

    it('labels a criterion with the stored name, there being no key to translate', () => {
        expect(criteria()[0]!.label).toBe(age.name);
    });
});

describe('buildActivityFilters', () => {
    it('is empty for untouched criteria, so the list shows everything', () => {
        expect(leaves(buildActivityFilters(criteria(), '', null))).toEqual([]);
    });

    it('searches name and description, either of which may match', () => {
        const group = buildActivityFilters(criteria(), 'hunt', null);

        expect(leaves(group).map(filter => filter.key)).toEqual(['name', 'description']);
    });

    it('keeps the search in a group of its own, so its ORs cannot widen the other criteria', () => {
        const group = buildActivityFilters(criteria(), 'hunt', ['act-1']);

        expect(group.filters.filter(filter => !('filters' in filter))).toHaveLength(1);
        expect(group.filters.filter(filter => 'filters' in filter)).toHaveLength(1);
    });

    it('narrows to the ids the sweep matched, with anyEquals so one query takes the lot', () => {
        const filter = leaves(buildActivityFilters(criteria(), '', ['act-1', 'act-2']))[0]!;

        expect([filter.key, filter.operator, filter.value])
            .toEqual(['id', FilterOperator.AnyEquals, ['act-1', 'act-2']]);
    });

    it('cannot express "nothing matched" as a filter, which is why the list never asks', () => {
        // An empty value is dropped like any other, so this group would show everything. The
        // caller answers that case itself rather than sending it.
        expect(leaves(buildActivityFilters(criteria(), '', []))).toEqual([]);
    });

    it('matches groups with anyEquals, being a relation on the activity itself', () => {
        const withGroups = [...criteria(), { key: 'groups', type: 'tags', value: ['grp-1'], field: 'groups', choices: [], label: '', operator: FilterOperator.AnyEquals } as Criterion];

        const filter = leaves(buildActivityFilters(withGroups, '', null))[0]!;

        expect([filter.key, filter.value]).toEqual(['groups', ['grp-1']]);
    });
});

describe('buildAttributeSweep', () => {
    it('asks for nothing when no attribute criterion is set', () => {
        expect(buildAttributeSweep(criteria(), catalogue))
            .toEqual({ values: null, picks: null, count: 0 });
    });

    it('bounds a range inclusively, so an activity whose range ends on the bound still matches', () => {
        const sweep = buildAttributeSweep(criteria({ age: { min: 6, max: 10 } }), catalogue);

        expect(leaves(sweep.values!).map(filter => [filter.key, filter.operator])).toEqual([
            ['attribute', FilterOperator.Equals],
            ['range_max', FilterOperator.GreaterOrEquals],
            ['range_min', FilterOperator.LessOrEquals],
        ]);
    });

    it('bounds a number against the one field that holds it', () => {
        const sweep = buildAttributeSweep(criteria({ 'temps-jeu': { min: 10, max: 30 } }), catalogue);

        expect(leaves(sweep.values!).map(filter => filter.key))
            .toEqual(['attribute', 'number_value', 'number_value']);
    });

    it('drops the bound the user left open rather than comparing against nothing', () => {
        const sweep = buildAttributeSweep(criteria({ age: { min: 6, max: null } }), catalogue);

        expect(leaves(sweep.values!).map(filter => filter.key)).toEqual(['attribute', 'range_max']);
    });

    it('sends a multi choice to the picks and a single choice to the values', () => {
        const sweep = buildAttributeSweep(criteria({
            'domaine': [art.id],
            'niveau-energie': ['opt-1'],
        }), catalogue);

        expect(leaves(sweep.picks!).map(filter => filter.value)).toEqual([domain.id, [art.id]]);
        expect(leaves(sweep.values!).map(filter => filter.value)).toEqual([energy.id, ['opt-1']]);
        expect(sweep.count).toBe(2);
    });

    it('counts every set criterion, which is what the intersection is measured against', () => {
        const sweep = buildAttributeSweep(criteria({
            age: { min: 6, max: null },
            'domaine': [art.id],
        }), catalogue);

        expect(sweep.count).toBe(2);
    });
});
