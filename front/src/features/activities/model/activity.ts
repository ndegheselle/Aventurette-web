import { ActivitiesEnvironmentOptions, type ActivitiesResourcesResponse, type ActivitiesResponse, type ActivitiesStepsResponse } from "@/backend/schema.g.ts";
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
    resources: StepResourceData[];
}>;

export type ActivityResourceData = ActivitiesResourcesResponse;

/**
 * A resource the user just picked. No record exists for it yet, so `file` holds the upload
 * itself where a saved resource holds the name of the stored file.
 */
export type NewActivityResourceData = { name: string; file: File; };

/** What a step being edited carries: resources already stored, and files not uploaded yet. */
export type StepResourceData = ActivityResourceData | NewActivityResourceData;

/** Tells the two apart by their `file`: the name of a stored file, or the file to upload. */
export function isUploadedResource(resource: StepResourceData): resource is ActivityResourceData {
    return typeof resource.file === "string";
}

export const ActivityEnvironment = ActivitiesEnvironmentOptions;

/** Relations to fetch alongside an activity for the detail and edit screens. */
export const ACTIVITY_RELATIONS = [
    "benefits",
    "steps", "steps.materials", "steps.resources",
];

export function createEmptyActivity(): ActivityData {
    return {
        benefits: [] as BenefitData[],
        steps: [] as ActivityStepData[]
    } as ActivityData;
}

export function createEmptyStep(): ActivityStepData {
    return {
        materials: [] as ActivityMaterialData[],
        resources: [] as StepResourceData[],
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
    return distinctById(
        (activity?.steps ?? [])
            .flatMap(step => step.resources ?? [])
            .filter(isUploadedResource),
    );
}

function distinctById<T extends { id: string }>(items: T[]): T[] {
    const byId = new Map<string, T>();
    for (const item of items)
        if (!byId.has(item.id)) byId.set(item.id, item);
    return [...byId.values()];
}
