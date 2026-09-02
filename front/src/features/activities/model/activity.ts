import { ActivitiesEnvironmentOptions, type ActivitiesResourcesResponse, type ActivitiesResponse, type ActivitiesStepsResponse } from "@/backend/schema.g.ts";
import type { BenefitData } from "@features/activities/model/benefit";
import type { ActivityMaterialData } from "@features/activities/model/material";

type ActivityExpand = {
    steps?: ActivityStepData[];
    benefits?: BenefitData[];
};

type ActivityStepExpand = {
    materials?: ActivityMaterialData[];
    resources?: ActivityResourceData[];
};

export type ActivityData = ActivitiesResponse<ActivityExpand>;
export type ActivityStepData = ActivitiesStepsResponse<ActivityStepExpand>;
export type ActivityResourceData = ActivitiesResourcesResponse;

export const ActivityEnvironment = ActivitiesEnvironmentOptions;

/** Relations to fetch alongside an activity for the detail and edit screens. */
export const ACTIVITY_RELATIONS = [
    "steps", "steps.benefits", "steps.materials", "steps.resources",
    "resources", "materials",
];

export function createEmptyStep(): ActivityStepData {
    return {
        expand: {
            materials: [],
            resources: []
        } as ActivityStepExpand
    } as ActivityStepData;
}
