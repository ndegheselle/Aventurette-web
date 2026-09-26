import { ActivitiesStateOptions, type ActivitiesResponse } from "@/backend/schema.g";
import { distinctById, type Entity } from "@chapelure/core";
import type {
    ActivityMaterialData,
    ActivityResourceData,
    ActivityStepData,
} from "@features/activities/model/step";

/**
 * An activity as the app uses it: `activity.steps` is the steps, not their ids. Everything else
 * it holds is a column of its own.
 */
export type ActivityData = Entity<ActivitiesResponse, {
    steps: ActivityStepData[];
}>;

export const ActivityState = ActivitiesStateOptions;

/** Every material used across an activity's steps. */
export function materialsOf(activity: ActivityData | null | undefined): ActivityMaterialData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.materials ?? []));
}

/** Every resource attached to an activity's steps. See `materialsOf`. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}
