import { createFilter, FilterOperator, type Filter } from "@chapelure/core";

/**
 * A translation lookup. Declared structurally rather than importing vue-i18n's
 * ComposerTranslation, so the model layer stays free of framework types.
 */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

/**
 * What a list can be narrowed by, as data.
 *
 * A criterion carries everything the three places that read it need: what it is called, what
 * the user has set it to, and which field of the record it constrains. The filter form is
 * generated from a list of criteria, the chips above the list are generated from the same list,
 * and so is the query — so adding a filter is adding an entry, rather than editing a form, a
 * toolbar and a query builder in step.
 *
 * What is deliberately *not* here is the icon. It is a Vue component, and `model/` does not
 * import the view layer; `useActivitiesList` hangs one on each criterion by key.
 */
export type CriterionType = 'range' | 'options' | 'tags';

/** Two bounds, either of which may be left open. */
export interface RangeValue {
    min: number | null;
    max: number | null;
}

/**
 * A value on offer. `label` is a translation key for `options`, whose choices the domain
 * declares, and a record's own name for `tags`, whose choices are loaded.
 */
export interface CriterionChoice {
    label: string;
    value: string;
}

interface BaseCriterion {
    /** Stable id — what the form keys its fields on, and what removing a chip names. */
    key: string;
    /** Translation key for the criterion's own name. */
    label: string;
}

/**
 * A number bounded from either end.
 *
 * `minField` and `maxField` are the record fields the bounds compare against: two different
 * ones when the record stores a range of its own, the same one twice when a single number is
 * bounded from both ends — an activity has an `ageMin` and an `ageMax`, but one
 * `durationMinutes`.
 */
export interface RangeCriterion extends BaseCriterion {
    type: 'range';
    minField: string;
    maxField: string;
    /** Prefix of the `.range`, `.minOnly` and `.maxOnly` keys a set range reads as. */
    display: string;
    value: RangeValue;
}

/**
 * A pick from a list, held as the values picked.
 *
 * `options` are a fixed set the domain declares and the form renders as checkboxes; `tags` are
 * loaded at runtime and picked from a dropdown. That is the whole difference — and the reason
 * one's labels are translation keys and the other's are data.
 */
export interface ChoiceCriterion extends BaseCriterion {
    type: 'options' | 'tags';
    field: string;
    operator: FilterOperator;
    choices: CriterionChoice[];
    value: string[];
}

export type Criterion = RangeCriterion | ChoiceCriterion;

export function rangeCriterion(criterion: Omit<RangeCriterion, 'type' | 'value'>): RangeCriterion {
    return { ...criterion, type: 'range', value: { min: null, max: null } };
}

export function optionsCriterion(criterion: Omit<ChoiceCriterion, 'type' | 'value'>): ChoiceCriterion {
    return { ...criterion, type: 'options', value: [] };
}

/** Tags start with no choices: they are what the screen's api call brings back. */
export function tagsCriterion(criterion: Omit<ChoiceCriterion, 'type' | 'value' | 'choices'>): ChoiceCriterion {
    return { ...criterion, type: 'tags', choices: [], value: [] };
}

/** Whether anything is set. An untouched criterion filters nothing and shows no chip. */
export function isCriterionSet(criterion: Criterion): boolean {
    return criterion.type === 'range'
        ? Boolean(criterion.value.min || criterion.value.max)
        : criterion.value.length > 0;
}

/**
 * What a criterion reads as on its chip: a range as one bound or both, a pick as its values
 * joined. An unset one has nothing to show and describes to an empty string.
 *
 * A value with no matching choice is dropped — a benefit the catalogue no longer holds has no
 * name to show for it.
 */
export function describeCriterion(t: Translate, criterion: Criterion): string {
    if (criterion.type === 'range')
        return formatRange(t, criterion.display, criterion.value.min, criterion.value.max) ?? '';

    return criterion.value
        .map(value => criterion.choices.find(choice => choice.value === value))
        .filter((choice): choice is CriterionChoice => Boolean(choice))
        .map(choice => criterion.type === 'options' ? t(choice.label) : choice.label)
        .join(', ');
}

/** Render a pair of bounds, tolerating either being missing. */
export function formatRange(t: Translate, display: string, min?: number | null, max?: number | null): string | null {
    if (min && max) {
        return t(`${display}.range`, { min, max });
    } else if (min) {
        return t(`${display}.minOnly`, { min });
    } else if (max) {
        return t(`${display}.maxOnly`, { max });
    }

    return null;
}

/**
 * A copy the modal can edit without touching what the list is showing.
 *
 * Choices are shared rather than copied: they are what can be picked and not what is, they do
 * not change while the modal is open, and `TagSelect` compares them by identity.
 */
export function cloneCriteria<T extends Criterion>(criteria: T[]): T[] {
    return criteria.map(criterion => withValue(criterion, criterion.type === 'range'
        ? { ...criterion.value }
        : [...criterion.value]));
}

/** The same criteria with nothing set on them. */
export function clearedCriteria<T extends Criterion>(criteria: T[]): T[] {
    return criteria.map(criterion => clearedCriterion(criterion));
}

/** The same criteria with one of them cleared — a chip's cross. An unknown key changes nothing. */
export function withoutCriterion<T extends Criterion>(criteria: T[], key: string): T[] {
    return criteria.map(criterion => criterion.key === key ? clearedCriterion(criterion) : criterion);
}

/** The same criteria with one's choices filled in, which is what a `tags` criterion waits for. */
export function withChoices<T extends Criterion>(criteria: T[], key: string, choices: CriterionChoice[]): T[] {
    return criteria.map(criterion => criterion.key === key && criterion.type !== 'range'
        ? { ...criterion, choices } as T
        : criterion);
}

/**
 * The filters a criterion contributes to a query.
 *
 * An unset one contributes filters with empty values, which `removeEmptyFilters` drops — so
 * there is no branch for "not set" here, and none in the caller either.
 */
export function criterionFilters<T>(criterion: Criterion): Filter<T>[] {
    if (criterion.type === 'range') {
        return [
            createFilter<T>({ key: criterion.minField as keyof T, value: criterion.value.min, operator: FilterOperator.GreaterThan }),
            createFilter<T>({ key: criterion.maxField as keyof T, value: criterion.value.max, operator: FilterOperator.LessThan }),
        ];
    }

    // Copied, so editing the criterion afterwards cannot mutate a query already sent.
    return [createFilter<T>({ key: criterion.field as keyof T, value: [...criterion.value], operator: criterion.operator })];
}

function clearedCriterion<T extends Criterion>(criterion: T): T {
    return withValue(criterion, criterion.type === 'range' ? { min: null, max: null } : []);
}

/**
 * The same criterion holding a different value.
 *
 * The cast is TypeScript's limit rather than a lie: every other field is copied across, and the
 * value handed in is the one the criterion's own type declares — which each caller, branching
 * on `type` first, is what guarantees.
 */
function withValue<T extends Criterion>(criterion: T, value: RangeValue | string[]): T {
    return { ...criterion, value } as T;
}
