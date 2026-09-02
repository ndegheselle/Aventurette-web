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
    resources: ActivityResourceData[];
}>;

export type ActivityResourceData = ActivitiesResourcesResponse;

export const ActivityEnvironment = ActivitiesEnvironmentOptions;

/** Relations to fetch alongside an activity for the detail and edit screens. */
export const ACTIVITY_RELATIONS = [
    "benefits",
    "steps", "steps.materials", "steps.resources",
];

export function createEmptyStep(): ActivityStepData {
    return {
        materials: [] as ActivityMaterialData[],
        resources: [] as ActivityResourceData[],
    } as ActivityStepData;
}
