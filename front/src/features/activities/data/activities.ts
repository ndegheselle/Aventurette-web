import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import type { BenefitData } from "@features/activities/data/benefits";
import { type ActivitiesResponse, type ActivitiesStepsResponse, Collections } from "@shared/types.g.ts";

type ActivityExpand = {
    steps?: ActivityStepData[];
};

type ActivityStepExpand = {
    benefits?: BenefitData[];
};

export type ActivityData = ActivitiesResponse<ActivityExpand>;
export type ActivityStepData = ActivitiesStepsResponse<ActivityStepExpand>;

class ActivitiesService extends PocketbaseCrud<ActivityData> {
    constructor() {
        super(Collections.Activities, ["name", "summary", "description"], ["steps", "steps.benefits", "steps.benefits"]);
    }
}

export function getUniqueBenefits(activity: ActivityData | null): BenefitData[] {
    if (!activity) return [];
    const benefits = activity.expand.steps?.flatMap(s => s.expand?.benefits ?? []) ?? [];
    return Array.from(new Map(benefits.map(b => [b.id, b])).values());
}

export const activities = new ActivitiesService();