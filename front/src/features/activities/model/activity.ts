import { ActivitiesStateOptions, type ActivitiesResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import type {
    ActivityAttributeOptionData,
    ActivityAttributeValueData,
    AttributeData,
    GroupData,
} from "@features/activities/model/attribute";
import {
    EMPTY_DESCRIPTION,
    type ActivityMaterialData,
    type ActivityResourceData,
    type ActivityStepData,
} from "@features/activities/model/step";

/**
 * An activity as the app uses it: `activity.steps` is the steps, not their ids, and what it
 * holds for the catalogue's attributes comes with it — `attributes` for the typed values,
 * `picks` for the multi_choice options.
 *
 * Both of those are rows of their own collections pointing back here, so they read with the
 * activity and are written on their own. Saving an activity never writes them.
 */
export type ActivityData = Entity<ActivitiesResponse, {
    groups: GroupData[];
    steps: ActivityStepData[];
    attributes: ActivityAttributeValueData[];
    picks: ActivityAttributeOptionData[];
}>;

export const ActivityState = ActivitiesStateOptions;

// Declared in `step.ts`, re-exported here: an activity seeds its description with it too.
export { EMPTY_DESCRIPTION };

/**
 * A blank activity: written when the user starts one, and bound to the edit form until the real
 * record arrives.
 *
 * `description` and `state` are seeded because the collection requires them, and an activity is
 * created before it is filled in. `name` is the caller's — only it can translate a placeholder.
 */
export function createEmptyActivity(): ActivityData {
    return {
        name: "",
        description: EMPTY_DESCRIPTION,
        state: ActivityState.DRAFT,
        groups: [] as GroupData[],
        steps: [] as ActivityStepData[],
        attributes: [] as ActivityAttributeValueData[],
        picks: [] as ActivityAttributeOptionData[],
    } as ActivityData;
}

/** What the activity holds for one attribute, or undefined when it holds nothing. */
export function valueOf(activity: ActivityData | null | undefined, attribute: AttributeData) {
    return activity?.attributes.find(value => value.attribute === attribute.id);
}

/** The options the activity picked for one attribute, in the vocabulary's own order. */
export function picksOf(
    activity: ActivityData | null | undefined,
    attribute: AttributeData,
) {
    const picked = new Set(
        (activity?.picks ?? [])
            .filter(pick => pick.attribute === attribute.id)
            .map(pick => pick.option),
    );

    return attribute.options.filter(option => picked.has(option.id));
}

/**
 * Every material used across an activity's steps — they hang off steps, not off the activity.
 * Deduplicated by id, in first-use order.
 */
export function materialsOf(activity: ActivityData | null | undefined): ActivityMaterialData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.materials ?? []));
}

/** Every resource attached to an activity's steps. See `materialsOf`. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}

function distinctById<T extends { id: string }>(items: T[]): T[] {
    const byId = new Map<string, T>();
    for (const item of items)
        if (!byId.has(item.id)) byId.set(item.id, item);
    return [...byId.values()];
}
