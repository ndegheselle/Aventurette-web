import { FilterOperator } from '@chapelure/core';
import { describe, expect, it, vi } from 'vitest';
import { isCriterionSet, optionsCriterion, rangeCriterion, tagsCriterion } from './criteria';
import { useFilters } from './useFilters';

/**
 * The draft dance, which is the whole point of this composable: what the list is showing only
 * changes when something says so, and `onApply` fires exactly then.
 */

const criteria = () => [
    rangeCriterion({ key: 'age', label: 'fields.age', display: 'age', minField: 'ageMin', maxField: 'ageMax' }),
    optionsCriterion({
        key: 'environment',
        label: 'fields.environment',
        field: 'environment',
        operator: FilterOperator.Equals,
        choices: [{ label: 'environment.INDOOR', value: 'INDOOR' }],
    }),
    tagsCriterion({ key: 'benefits', label: 'fields.benefits', field: 'benefits', operator: FilterOperator.AnyEquals }),
];

function withFilters() {
    const onApply = vi.fn();
    return { filters: useFilters(criteria(), onApply), onApply };
}

/** Set a criterion in the draft, the way the form's inputs would. */
function pick(filters: ReturnType<typeof useFilters>, key: string, value: unknown) {
    (filters.draft.value.find(criterion => criterion.key === key) as any).value = value;
}

const applied = (filters: ReturnType<typeof useFilters>) =>
    filters.applied.value.filter(isCriterionSet).map(criterion => criterion.key);

describe('useFilters', () => {
    it('leaves the list alone while the modal is being edited', () => {
        const { filters, onApply } = withFilters();

        pick(filters, 'age', { min: 6, max: null });

        expect(applied(filters)).toEqual([]);
        expect(onApply).not.toHaveBeenCalled();
    });

    it('adopts the draft and re-queries when it is confirmed', () => {
        const { filters, onApply } = withFilters();

        pick(filters, 'age', { min: 6, max: null });
        filters.applyDraft();

        expect(applied(filters)).toEqual(['age']);
        expect(onApply).toHaveBeenCalledOnce();
    });

    it('puts the draft back to what is applied when it is discarded', () => {
        const { filters } = withFilters();

        pick(filters, 'age', { min: 6, max: null });
        filters.discardDraft();
        filters.applyDraft();

        expect(applied(filters)).toEqual([]);
    });

    it('clears one criterion without touching the others, and re-queries', () => {
        const { filters, onApply } = withFilters();
        pick(filters, 'age', { min: 6, max: null });
        pick(filters, 'environment', ['INDOOR']);
        filters.applyDraft();

        filters.removeCriterion('age');

        expect(applied(filters)).toEqual(['environment']);
        expect(onApply).toHaveBeenCalledTimes(2);
    });

    it('clears the search along with the criteria', () => {
        const { filters } = withFilters();
        filters.search.value = 'hunt';
        pick(filters, 'environment', ['INDOOR']);
        filters.applyDraft();

        filters.clearApplied();

        expect(applied(filters)).toEqual([]);
        expect(filters.search.value).toBe('');
    });

    it('offers loaded choices to the modal and to what is already applied', () => {
        const { filters } = withFilters();

        filters.setChoices('benefits', [{ label: 'Coordination', value: 'bnf-1' }]);

        for (const list of [filters.applied.value, filters.draft.value]) {
            const benefits = list.find(criterion => criterion.key === 'benefits')!;
            expect(benefits.type === 'tags' ? benefits.choices : []).toHaveLength(1);
        }
    });
});
