import { ActivitiesEnvironmentOptions, ActivitiesStateOptions, type ActivitiesResponse, type ActivitiesStepsResponse, type StepsResourcesResponse } from "@/backend/schema.g.ts";
import type { Expanded } from "@chapelure/core";
import type { BenefitData } from "@features/activities/model/benefit";
import type { ActivityMaterialData } from "@features/activities/model/material";

// Relations arrive inlined — `activity.steps` holds the steps themselves. What is listed here
// has to match ACTIVITY_RELATIONS below; nothing checks that for us.
export type ActivityData = Expanded<ActivitiesResponse, {
    benefits: BenefitData[];
    steps: ActivityStepData[];
}>;

export type ActivityStepData = Expanded<ActivitiesStepsResponse, {
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
}>;

/**
 * A resource is always a record: a picked file is uploaded the moment it is chosen, so `file`
 * only ever holds the name of a stored file — never the upload itself. It belongs to the step
 * it was uploaded for, which is what `step` says.
 */
export type ActivityResourceData = StepsResourcesResponse;

export const ActivityEnvironment = ActivitiesEnvironmentOptions;

export const ActivityState = ActivitiesStateOptions;

/** Relations to fetch alongside a step, and to write back as ids when one is saved. */
export const STEP_RELATIONS = ["materials", "resources"];

/** Relations to fetch alongside an activity for the detail and edit screens. */
export const ACTIVITY_RELATIONS = [
    "benefits",
    "steps", ...STEP_RELATIONS.map(relation => `steps.${relation}`),
];

/** What a required editor field holds when there is nothing in it yet. */
export const EMPTY_DESCRIPTION = "<p></p>";

/**
 * A blank activity: what is written when the user starts one, and what the edit form binds to
 * until the real record arrives.
 *
 * `description`, `environment` and `state` are seeded because the collection requires them —
 * an activity is created before it is filled in, so it has to be valid while still empty, and
 * `DRAFT` is what an activity nobody has finished is. The `<select>` shows its first option
 * for an unmatched value anyway, which is the other reason not to leave the environment
 * undefined: it would save something other than what is on screen. `name` is left to the
 * caller, which is the one that can translate a placeholder.
 */
export function createEmptyActivity(): ActivityData {
    return {
        name: "",
        description: EMPTY_DESCRIPTION,
        environment: ActivityEnvironment.INDOOR,
        state: ActivityState.DRAFT,
        benefits: [] as BenefitData[],
        steps: [] as ActivityStepData[]
    } as ActivityData;
}

/**
 * A blank step, written the moment one is added.
 *
 * `description` is seeded for the same reason an activity's is: the collection requires it,
 * and the step exists before it is filled in. `activity` is the owner the collection requires
 * too — a step is not a free-floating record that an activity later points at.
 */
export function createEmptyStep(activity: string): ActivityStepData {
    return {
        activity,
        description: EMPTY_DESCRIPTION,
        materials: [] as ActivityMaterialData[],
        resources: [] as ActivityResourceData[],
    } as ActivityStepData;
}

/**
 * Every distinct material used across an activity's steps.
 *
 * Materials and resources hang off steps, not off the activity — the detail screen shows them
 * for the activity as a whole, so it has to gather them. Deduplicated by id, because two steps
 * needing the same rope should list it once, and kept in first-use order.
 */
export function materialsOf(activity: ActivityData | null | undefined): ActivityMaterialData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.materials ?? []));
}

/** Every distinct resource attached to an activity's steps. See `materialsOf`. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}

function distinctById<T extends { id: string }>(items: T[]): T[] {
    const byId = new Map<string, T>();
    for (const item of items)
        if (!byId.has(item.id)) byId.set(item.id, item);
    return [...byId.values()];
}
