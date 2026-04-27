import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import type { BenefitData } from "@features/activities/data/benefits";
import { type ActivitiesResponse, type ActivitiesStepsResponse, type ActivitiesMaterialsResponse, type ActivitiesResourcesResponse, Collections } from "@shared/types.g.ts";

type ActivityExpand = {
    steps?: ActivityStepData[];
    materials?: ActivityResourceData[];
    resources?: ActivityMaterialData[];
};

type ActivityStepExpand = {
    benefits?: BenefitData[];
    materials?: ActivityResourceData[];
    resources?: ActivityMaterialData[];
};

export type ActivityData = ActivitiesResponse<ActivityExpand>;
export type ActivityStepData = ActivitiesStepsResponse<ActivityStepExpand>;
export type ActivityResourceData = ActivitiesResourcesResponse;
export type ActivityMaterialData = ActivitiesMaterialsResponse;

class ActivitiesService extends PocketbaseCrud<ActivityData> {
    constructor() {
        super(Collections.Activities, 
            ["name", "summary", "description"], 
            [
                "steps", "steps.benefits", "steps.benefits", "steps.materials", "steps.resources",
                "resources", "materials" 
            ]);
    }
}

export function getUniqueBenefits(activity: ActivityData | null): BenefitData[] {
    if (!activity) return [];
    const benefits = activity.expand.steps?.flatMap(s => s.expand?.benefits ?? []) ?? [];
    return Array.from(new Map(benefits.map(b => [b.id, b])).values());
}

export const activities = new ActivitiesService();