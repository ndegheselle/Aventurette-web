import { ActivitiesStateOptions, type ActivitiesResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import {
    EMPTY_DESCRIPTION,
    type ActivityMaterialData,
    type ActivityResourceData,
    type ActivityStepData,
} from "@features/activities/model/step";

/**
 * An activity as the app uses it: `activity.steps` is the steps, not their ids. Everything else
 * it holds is a column of its own.
 */
export type ActivityData = Entity<ActivitiesResponse, {
    steps: ActivityStepData[];
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
        steps: [] as ActivityStepData[],
    } as ActivityData;
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
