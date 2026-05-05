import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import type { BenefitData } from "@features/activities/data/benefits";
import { type ActivitiesResponse, type ActivitiesStepsResponse, type ActivitiesMaterialsResponse, type ActivitiesResourcesResponse, Collections, ActivitiesEnvironmentOptions } from "@shared/types.g.ts";

type ActivityExpand = {
    steps?: ActivityStepData[];
    materials?: ActivityResourceData[];
    resources?: ActivityMaterialData[];
    benefits?: BenefitData[];
};

type ActivityStepExpand = {
    materials?: ActivityResourceData[];
    resources?: ActivityMaterialData[];
};

export type ActivityData = ActivitiesResponse<ActivityExpand>;
export type ActivityStepData = ActivitiesStepsResponse<ActivityStepExpand>;
export type ActivityResourceData = ActivitiesResourcesResponse;
export type ActivityMaterialData = ActivitiesMaterialsResponse;
export const ActivityEnvironment = ActivitiesEnvironmentOptions;

class ActivitiesService extends PocketbaseCrud<ActivityData> {
    constructor() {
        super(Collections.Activities,
            [
                "steps", "steps.benefits", "steps.benefits", "steps.materials", "steps.resources",
                "resources", "materials"
            ]);
    }
}

export const activities = new ActivitiesService();