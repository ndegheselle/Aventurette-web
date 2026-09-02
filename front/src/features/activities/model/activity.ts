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

export function createEmptyStep(): ActivityStepData {
    return {
        materials: [] as ActivityMaterialData[],
        resources: [] as StepResourceData[],
    } as ActivityStepData;
}
