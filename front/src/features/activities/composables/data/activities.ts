import { usePocketBaseCrud } from "@chapelure/api/pocketbase.ts";
import type { BenefitData } from "@features/activities/composables/data/benefits";
import type { ActivityMaterialData } from "@features/activities/composables/data/materials";
import { ActivitiesEnvironmentOptions, type ActivitiesResourcesResponse, type ActivitiesResponse, type ActivitiesStepsResponse, Collections } from "@shared/types.g.ts";

type ActivityExpand = {
    steps?: ActivityStepData[];
    materials?: ActivityMaterialData[];
    resources?: ActivityResourceData[];
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

export function createEmptyStep() : ActivityStepData
{
    return {
        expand: {
            materials: [],
            resources: []
        } as ActivityStepExpand
    } as ActivityStepData;
}

export function useActivities() {
    return usePocketBaseCrud<ActivityData>(Collections.Activities,
        [
            "steps", "steps.benefits", "steps.benefits", "steps.materials", "steps.resources",
            "resources", "materials"
        ]);
}