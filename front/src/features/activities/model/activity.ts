import { ActivitiesStateOptions, type ActivitiesResponse } from "@/backend/schema.g";
import { distinctById, type Entity } from "@chapelure/core";
import {
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
        description: "",
        state: ActivityState.DRAFT,
        steps: [] as ActivityStepData[],
    } as ActivityData;
}

/**
 * Every material used across an activity's steps.
 */
export function materialsOf(activity: ActivityData | null | undefined): ActivityMaterialData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.materials ?? []));
}

/** Every resource attached to an activity's steps. See `materialsOf`. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}