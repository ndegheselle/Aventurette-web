import { FilterOperator } from '@chapelure/core';
import {
    clearedCriteria,
    cloneCriteria,
    collapseHidesPick,
    COLLAPSED_CHOICES,
    criterionFilters,
    hiddenChoiceCount,
    describeCriterion,
    isCriterionSet,
    optionsCriterion,
    rangeCriterion,
    tagsCriterion,
    visibleChoices,
    withChoices,
    withoutCriterion,
    type Criterion,
} from './criteria';
import { describe, expect, it } from 'vitest';

// What a criterion is set to, what it reads as, and what it contributes to a query. The criteria
// a screen declares are that feature's own.

// Translations are not under test: this fake shows the key and what it interpolates.
const t = (key: string, params?: Record<string, unknown>) =>
    params ? `${key}(${Object.values(params).join(',')})` : key;

const age = () => rangeCriterion({
    key: 'age', label: 'fields.age', display: 'age', minField: 'ageMin', maxField: 'ageMax',
    floor: 0, ceiling: 18,
});

const environment = () => optionsCriterion({
    key: 'environment',
    label: 'fields.environment',
    field: 'environment',
    operator: FilterOperator.Equals,
    choices: [{ label: 'environment.INDOOR', value: 'INDOOR' }, { label: 'environment.CAR', value: 'CAR' }],
});

const benefits = () => tagsCriterion({
    key: 'benefits', label: 'fields.benefits', field: 'benefits', operator: FilterOperator.AnyEquals,
});

/** The same criterion holding a value, which is what the form would have written into it. */
function set<T extends Criterion>(criterion: T, value: T['value']): T {
    return { ...criterion, value } as T;
}

/** A vocabulary two longer than the fold, so there is something to hide and something to find. */
const long = () => optionsCriterion({
    key: 'season',
    label: 'fields.season',
    field: 'season',
    operator: FilterOperator.AnyEquals,
    choices: Array.from({ length: COLLAPSED_CHOICES + 2 }, (_, index) => ({
        label: `season.S${index}`, value: `S${index}`,
    })),
});

describe('isCriterionSet', () => {
    it('is false until a bound or a value is picked', () => {
        expect(isCriterionSet(age())).toBe(false);
        expect(isCriterionSet(environment())).toBe(false);
    });

    it('is set by either bound on its own', () => {
        expect(isCriterionSet(set(age(), { min: null, max: 10 }))).toBe(true);
        expect(isCriterionSet(set(age(), { min: 6, max: null }))).toBe(true);
    });
});

describe('describeCriterion', () => {
    it('folds both bounds of a range into one reading, and either alone into its own', () => {
        expect(describeCriterion(t, set(age(), { min: 6, max: 10 }))).toBe('age.range(6,10)');
        expect(describeCriterion(t, set(age(), { min: 6, max: null }))).toBe('age.minOnly(6)');
        expect(describeCriterion(t, set(age(), { min: null, max: 10 }))).toBe('age.maxOnly(10)');
    });

    it('joins every value picked, so a chip shows all of them and not just the first', () => {
        expect(describeCriterion(t, set(environment(), ['INDOOR', 'CAR'])))
            .toBe('environment.INDOOR, environment.CAR');
    });

    it('translates an option label but not a tag name, the one being a key and the other data', () => {
        const chosen = withChoices([benefits()], 'benefits', [{ label: 'Coordination', value: 'bnf-1' }]);

        expect(describeCriterion(t, set(chosen[0]!, ['bnf-1']))).toBe('Coordination');
    });

    it('drops a value the choices no longer hold, there being no name to show for it', () => {
        expect(describeCriterion(t, set(benefits(), ['bnf-gone']))).toBe('');
    });
});

describe('cloneCriteria', () => {
    it('copies the values, so editing the draft leaves what is applied alone', () => {
        const applied = [set(age(), { min: 6, max: null }), set(environment(), ['INDOOR'])];
        const draft = cloneCriteria(applied);

        (draft[0] as ReturnType<typeof age>).value.min = 12;
        (draft[1] as ReturnType<typeof environment>).value.push('CAR');

        expect((applied[0] as ReturnType<typeof age>).value.min).toBe(6);
        expect((applied[1] as ReturnType<typeof environment>).value).toEqual(['INDOOR']);
    });
});

describe('withoutCriterion', () => {
    it('clears the one named and leaves the rest as they were', () => {
        const criteria = [set(age(), { min: 6, max: 10 }), set(environment(), ['INDOOR'])];

        const left = withoutCriterion(criteria, 'age');

        expect(left.filter(isCriterionSet).map(criterion => criterion.key)).toEqual(['environment']);
    });

    it('keeps the choices, which are what can be picked and not what is', () => {
        const criteria = withChoices([benefits()], 'benefits', [{ label: 'Coordination', value: 'bnf-1' }]);

        const cleared = withoutCriterion(criteria.map(criterion => set(criterion, ['bnf-1'])), 'benefits')[0]!;

        expect(cleared.type === 'tags' ? cleared.choices : []).toHaveLength(1);
    });
});

describe('clearedCriteria', () => {
    it('empties every criterion at once', () => {
        const criteria = [set(age(), { min: 6, max: 10 }), set(environment(), ['INDOOR'])];

        expect(clearedCriteria(criteria).filter(isCriterionSet)).toEqual([]);
    });
});

describe('criterionFilters', () => {
    it('bounds a range from both ends, each against the field it was declared with', () => {
        const filters = criterionFilters(set(age(), { min: 6, max: 10 }));

        expect(filters.map(filter => [filter.key, filter.value, filter.operator])).toEqual([
            ['ageMin', 6, FilterOperator.GreaterThan],
            ['ageMax', 10, FilterOperator.LessThan],
        ]);
    });

    it('matches a pick with the operator the criterion carries', () => {
        expect(criterionFilters(set(benefits(), ['bnf-1']))[0]!.operator).toBe(FilterOperator.AnyEquals);
    });

    it('copies the values in, so editing the criterion cannot mutate a query already sent', () => {
        const criterion = set(environment(), ['INDOOR']);
        const [filter] = criterionFilters(criterion);

        criterion.value.push('CAR');

        expect(filter!.value).toEqual(['INDOOR']);
    });
});

// A long vocabulary is cut to its first few until the user asks for the rest. The rule worth
// pinning is the third one: collapsing must never hide a pick, or confirming the form would
// clear a filter the user could not see.

describe('visibleChoices', () => {
    it('cuts a long list to the fold, and shows the lot once expanded', () => {
        expect(visibleChoices(long(), false)).toHaveLength(COLLAPSED_CHOICES);
        expect(visibleChoices(long(), true)).toHaveLength(COLLAPSED_CHOICES + 2);
    });

    it('leaves a short list whole, collapsed or not', () => {
        expect(visibleChoices(environment(), false)).toHaveLength(2);
    });

    it('is empty for a range, which has no choices to cut', () => {
        expect(visibleChoices(age(), false)).toEqual([]);
    });
});

describe('hiddenChoiceCount', () => {
    it('counts what the fold holds back, which is also whether to offer the button', () => {
        expect(hiddenChoiceCount(long())).toBe(2);
        expect(hiddenChoiceCount(environment())).toBe(0);
        expect(hiddenChoiceCount(age())).toBe(0);
    });
});

describe('collapseHidesPick', () => {
    it('is true when something picked sits past the fold', () => {
        expect(collapseHidesPick(set(long(), [`S${COLLAPSED_CHOICES}`]))).toBe(true);
    });

    it('is false when every pick is visible anyway', () => {
        expect(collapseHidesPick(set(long(), ['S0']))).toBe(false);
        expect(collapseHidesPick(set(environment(), ['CAR']))).toBe(false);
    });

    it('is false for an untouched criterion, and for a range', () => {
        expect(collapseHidesPick(long())).toBe(false);
        expect(collapseHidesPick(age())).toBe(false);
    });
});
