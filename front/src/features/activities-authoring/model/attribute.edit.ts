import type { ActivityData } from "@features/activities/model/activity";
import { picksOf, valueOf } from "@features/activities/model/activity";
import {
    AttributeType,
    type ActivityAttributeValueData,
    type AttributeData,
} from "@features/activities/model/attribute";

/**
 * Editing an activity's attributes. The form binds to a draft per attribute — one flat shape
 * whatever the type, so a field component has one thing to `v-model` — and saving turns the
 * drafts back into the rows the two collections hold.
 */

/** What the form holds for one attribute. Every type uses the field it needs and leaves the rest. */
export interface AttributeDraft {
    attribute: AttributeData;
    text: string;
    number: number | null;
    min: number | null;
    max: number | null;
    /** The single_choice pick, as an option id. */
    option: string;
    /** The multi_choice picks, as option ids. */
    options: string[];
}

/**
 * A number the user actually gave, or null.
 *
 * A cleared `<input type="number">` binds as an empty string rather than null, which would
 * otherwise read as a value and keep a row the user meant to empty.
 *
 * Zero is kept: "0 minutes of preparation" is an answer. It does mean an unset bound reads as a
 * set one, PocketBase answering an unset number field with `0` — harmless, because a zero bound
 * formats as no bound (see `formatRange`) and writing it back stores what was already there.
 */
function numeric(value: number | string | null | undefined): number | null {
    if (value === '' || value === null || value === undefined) return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

/** A draft per attribute, seeded from what the activity already holds. */
export function attributeDrafts(attributes: AttributeData[], activity: ActivityData): AttributeDraft[] {
    return attributes.map((attribute) => {
        const value = valueOf(activity, attribute);

        return {
            attribute,
            text: value?.string_value ?? '',
            number: numeric(value?.number_value),
            min: numeric(value?.range_min),
            max: numeric(value?.range_max),
            option: value?.option ?? '',
            options: picksOf(activity, attribute).map(option => option.id),
        };
    });
}

/** Whether the user left this attribute blank — what tells a save to delete the row instead. */
export function isDraftEmpty(draft: AttributeDraft): boolean {
    switch (draft.attribute.type) {
        case AttributeType.multi_choice:
            return draft.options.length === 0;
        case AttributeType.single_choice:
            return !draft.option;
        case AttributeType.range:
            return numeric(draft.min) == null && numeric(draft.max) == null;
        case AttributeType.number:
            return numeric(draft.number) == null;
        default:
            return !draft.text.trim();
    }
}

/** The fields a draft writes into its value row — only the ones its type uses. */
export function draftFields(draft: AttributeDraft): Partial<ActivityAttributeValueData> {
    switch (draft.attribute.type) {
        case AttributeType.single_choice:
            return { option: draft.option };
        case AttributeType.range:
            return { range_min: numeric(draft.min) ?? undefined, range_max: numeric(draft.max) ?? undefined };
        case AttributeType.number:
            return { number_value: numeric(draft.number) ?? undefined };
        default:
            return { string_value: draft.text.trim() };
    }
}

/**
 * Everything saving the attributes has to write, worked out before anything is sent.
 *
 * Kept as data rather than done inline so the order is the caller's and the decisions are
 * testable: which rows are new, which changed, and which the user emptied.
 */
export interface AttributeWrites {
    /** Value rows to create — no id yet. */
    created: Partial<ActivityAttributeValueData>[];
    /** Value rows to update, by id. */
    updated: { id: string, fields: Partial<ActivityAttributeValueData> }[];
    /** Value rows whose attribute the user emptied. */
    removed: string[];
    /** Option picks to add, as the rows they will become. */
    picked: { activity: string, attribute: string, option: string }[];
    /** Pick rows the user unticked, by id. */
    unpicked: string[];
}

/**
 * What the drafts changed, against what the activity holds.
 *
 * A multi_choice attribute has no value row at all — its picks are rows of their own — so it
 * only ever contributes to `picked` and `unpicked`. Every other type has one row per attribute,
 * which the unique index guarantees, so emptying a field deletes rather than blanks it.
 */
export function attributeWrites(drafts: AttributeDraft[], activity: ActivityData): AttributeWrites {
    const writes: AttributeWrites = { created: [], updated: [], removed: [], picked: [], unpicked: [] };

    for (const draft of drafts) {
        const attribute = draft.attribute;

        if (attribute.type === AttributeType.multi_choice) {
            const held = activity.picks.filter(pick => pick.attribute === attribute.id);
            const wanted = new Set(draft.options);

            for (const option of draft.options)
                if (!held.some(pick => pick.option === option))
                    writes.picked.push({ activity: activity.id, attribute: attribute.id, option });

            for (const pick of held)
                if (!wanted.has(pick.option)) writes.unpicked.push(pick.id);

            continue;
        }

        const existing = valueOf(activity, attribute);

        if (isDraftEmpty(draft)) {
            if (existing) writes.removed.push(existing.id);
        } else if (existing) {
            writes.updated.push({ id: existing.id, fields: draftFields(draft) });
        } else {
            writes.created.push({
                activity: activity.id,
                attribute: attribute.id,
                ...draftFields(draft),
            });
        }
    }

    return writes;
}
