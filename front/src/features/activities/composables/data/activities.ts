import { usePocketBaseCrud } from "@chapelure/api/pocketbase.ts";
import type { BenefitData } from "@features/activities/composables/data/benefits";
import type { ActivityMaterialData } from "@features/activities/composables/data/materials";
import { ActivitiesEnvironmentOptions, type ActivitiesResourcesResponse, type ActivitiesResponse, type ActivitiesStepsResponse, Collections } from "@shared/types.g.ts";

type ActivityExpand = {
    steps?: ActivityStepData[];
    materials?: ActivityResourceData[];
    resources?: ActivityMaterialData[];
    benefits?: BenefitData[];
};

type ActivityStepExpand = {
    materials?: ActivityResourceData[];
    resources?: ActivityMaterialData[];

    toSync: {
        resources: File[];
    }
};

export type ActivityData = ActivitiesResponse<ActivityExpand>;
export type ActivityStepData = ActivitiesStepsResponse<ActivityStepExpand>;
export type ActivityResourceData = ActivitiesResourcesResponse;
export const ActivityEnvironment = ActivitiesEnvironmentOptions;

export function useActivities() {
    return usePocketBaseCrud<ActivityData>(Collections.Activities,
        [
            "steps", "steps.benefits", "steps.benefits", "steps.materials", "steps.resources",
            "resources", "materials"
        ]);
}