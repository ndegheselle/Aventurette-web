import { createFilter, FilterOperator, type Filter } from "@chapelure/core";
import type { Component } from "vue";

/** A translation lookup. Structural, so a test can pass any `t` — or a stub. */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

/**
 * What a list can be narrowed by, as data. Hand a list of criteria to `useFilters`: the form,
 * the chips and the query are all generated from it, so a new filter is a new entry.
 */
export type CriterionType = 'range' | 'options' | 'tags';

/** Two bounds, either of which may be left open. */
export interface RangeValue {
    min: number | null;
    max: number | null;
}

/** A value on offer. `label` is a translation key for `options`, a record's name for `tags`. */
export interface CriterionChoice {
    label: string;
    value: string;
}

interface BaseCriterion {
    /** Stable id, used to key the form's fields and to name the criterion a chip removes. */
    key: string;
    /** Translation key for the criterion's own name. */
    label: string;
    /** Shown on its field and its chip. A lucide icon, or anything renderable. */
    icon?: Component;
}

/**
 * A number bounded from either end.
 *
 * `minField` and `maxField` are the record fields the bounds compare against — two different
 * ones for a stored range (`ageMin`/`ageMax`), the same one twice for a single number bounded
 * both ways (`durationMinutes`).
 */
export interface RangeCriterion extends BaseCriterion {
    type: 'range';
    minField: string;
    maxField: string;
    /** Translation key prefix: `.range`, `.minOnly` and `.maxOnly` hang off it. */
    display: string;
    value: RangeValue;
}

/**
 * A pick from a list, held as the values picked. `options` are a fixed set rendered as
 * checkboxes; `tags` are loaded at runtime and picked from a dropdown.
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

/** Tags start empty — fill them with `withChoices` once the screen's api call answers. */
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
 * joined. Unset describes to an empty string, and a value with no matching choice is dropped.
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
 * A copy the modal can edit without touching what the list is showing. Choices are shared, not
 * copied — `TagSelect` compares them by identity.
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

/** The same criteria with one cleared — a chip's cross. An unknown key changes nothing. */
export function withoutCriterion<T extends Criterion>(criteria: T[], key: string): T[] {
    return criteria.map(criterion => criterion.key === key ? clearedCriterion(criterion) : criterion);
}

/** The same criteria with one's choices filled in. What a `tags` criterion waits for. */
export function withChoices<T extends Criterion>(criteria: T[], key: string, choices: CriterionChoice[]): T[] {
    return criteria.map(criterion => criterion.key === key && criterion.type !== 'range'
        ? { ...criterion, choices } as T
        : criterion);
}

/**
 * The filters a criterion contributes to a query. An unset one contributes empty values, which
 * `removeEmptyFilters` drops — so neither this nor its caller branches on "not set".
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
 * The same criterion holding a different value. Every caller branches on `type` first, which is
 * what makes the cast safe.
 */
function withValue<T extends Criterion>(criterion: T, value: RangeValue | string[]): T {
    return { ...criterion, value } as T;
}
