import {
    AttributeDefinitionsTypeOptions,
    type ActivityAttributeOptionsResponse,
    type ActivityAttributeValuesResponse,
    type AttributeDefinitionsResponse,
    type AttributeOptionsResponse,
    type GroupsResponse,
} from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

/**
 * The attribute catalogue: the groups an activity belongs to, what each group defines, and the
 * vocabularies behind them. Adding a keyword is a row in `attribute_options`, never a column
 * here — which is the whole point of the catalogue.
 */

export type GroupData = Entity<GroupsResponse>;

export type AttributeOptionData = Entity<AttributeOptionsResponse>;

/** A definition as the backend stores it, before its options are joined on. */
export type AttributeDefinitionData = Entity<AttributeDefinitionsResponse>;

/** A definition with its vocabulary joined back on — what a field or a filter is built from. */
export type AttributeData = Entity<AttributeDefinitionsResponse, {
    options: AttributeOptionData[];
}>;

/** What an activity holds for one attribute: a number, a range, a text or one option. */
export type ActivityAttributeValueData = Entity<ActivityAttributeValuesResponse>;

/** One option an activity picked, for the multi_choice attributes. */
export type ActivityAttributeOptionData = Entity<ActivityAttributeOptionsResponse>;

export const AttributeType = AttributeDefinitionsTypeOptions;
export type AttributeType = AttributeDefinitionsTypeOptions;

/** The slug of the group whose attributes are offered whatever else is selected. */
export const GENERAL_GROUP = 'general';

/** A translation lookup. Structural, so `model/` stays free of framework types. */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

/**
 * Join the three reference collections: each definition carries the options that name it, and
 * they are ordered by their group before their own `sort_order`. They are fetched flat rather
 * than expanded — an option points at its definition, not the other way round.
 *
 * Grouping first is what keeps a form readable: every group numbers its attributes from one, so
 * sorting on `sort_order` alone interleaves the six developmental attributes with Général's.
 */
export function attributesWithOptions(
    definitions: AttributeDefinitionData[],
    options: AttributeOptionData[],
    groups: GroupData[] = [],
): AttributeData[] {
    const byAttribute = new Map<string, AttributeOptionData[]>();
    for (const option of ordered(options)) {
        const list = byAttribute.get(option.attribute) ?? [];
        list.push(option);
        byAttribute.set(option.attribute, list);
    }

    const groupOrder = new Map(groups.map((group, index) => [group.id, index]));
    const byGroup = (definition: AttributeDefinitionData) =>
        groupOrder.get(definition.group) ?? groups.length;

    return ordered(definitions)
        .sort((a, b) => byGroup(a) - byGroup(b))
        .map(definition => ({
            ...definition,
            options: byAttribute.get(definition.id) ?? [],
        }));
}

/**
 * What a screen offers once a group is selected: that group's attributes, then the general ones.
 * Selecting nothing offers the general ones alone.
 *
 * The general group comes last so a chosen group's own vocabulary reads first, and a group that
 * *is* general is not listed twice.
 */
export function attributesFor(
    attributes: AttributeData[],
    groups: GroupData[],
    selected: string[],
): AttributeData[] {
    const general = groups.find(group => group.slug === GENERAL_GROUP);
    const wanted = new Set(selected.filter(id => id !== general?.id));

    return [
        ...attributes.filter(attribute => wanted.has(attribute.group)),
        ...attributes.filter(attribute => attribute.group === general?.id),
    ];
}

/**
 * An attribute's options under the families they belong to, in first-seen order. Options with no
 * family are gathered under an empty key, which is every attribute but Imaginaire.
 */
export function optionsBySubgroup(attribute: AttributeData): { subgroup: string, options: AttributeOptionData[] }[] {
    const families: { subgroup: string, options: AttributeOptionData[] }[] = [];

    for (const option of attribute.options) {
        const subgroup = option.subgroup ?? '';
        const family = families.find(candidate => candidate.subgroup === subgroup);

        if (family) family.options.push(option);
        else families.push({ subgroup, options: [option] });
    }

    return families;
}

/**
 * What one attribute reads as on a badge: a range as one bound or both, a number with its unit
 * left to the caller, a pick as its labels joined. Null when the activity holds nothing for it,
 * so a display can skip it rather than render an empty badge.
 */
export function formatAttributeValue(
    t: Translate,
    attribute: AttributeData,
    value: ActivityAttributeValueData | undefined,
    picks: AttributeOptionData[] = [],
): string | null {
    if (attribute.type === AttributeType.multi_choice)
        return picks.length ? picks.map(option => option.label).join(', ') : null;

    if (!value) return null;

    switch (attribute.type) {
        case AttributeType.range:
            return formatRange(t, value.range_min, value.range_max);
        case AttributeType.number:
            return value.number_value != null ? String(value.number_value) : null;
        case AttributeType.single_choice:
            return attribute.options.find(option => option.id === value.option)?.label ?? null;
        default:
            return value.string_value || null;
    }
}

/** Render a pair of bounds, tolerating either being missing. */
export function formatRange(t: Translate, min?: number | null, max?: number | null): string | null {
    if (min && max) return t('activities.bounds.range', { min, max });
    if (min) return t('activities.bounds.minOnly', { min });
    if (max) return t('activities.bounds.maxOnly', { max });

    return null;
}

/**
 * The activities that matched **every** criterion, out of rows that matched any of them.
 *
 * The backend cannot answer this in one query: an attribute's value is a row of its own, so a
 * row can satisfy one criterion and never two. The list asks for the union and counts here —
 * an activity is a match when it produced a row for as many distinct attributes as were asked
 * about. One row per activity and attribute is what the unique index guarantees.
 */
export function activitiesMatchingAll(
    rows: { activity: string, attribute: string }[],
    expected: number,
): string[] {
    if (expected === 0) return [];

    const matched = new Map<string, Set<string>>();
    for (const row of rows) {
        const attributes = matched.get(row.activity) ?? new Set<string>();
        attributes.add(row.attribute);
        matched.set(row.activity, attributes);
    }

    return [...matched.entries()]
        .filter(([, attributes]) => attributes.size >= expected)
        .map(([activity]) => activity);
}

/** By `sort_order`, which every reference row carries. Ties keep the order they arrived in. */
function ordered<T extends { sort_order?: number }>(rows: T[]): T[] {
    return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
