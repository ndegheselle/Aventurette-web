import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import { type ActivitiesResponse, type ActivitiesStepsResponse, Collections } from "@shared/types.g.ts";

type ActivityExpand = {
    steps?: ActivityStepData[];
};

export type ActivityData = ActivitiesResponse<ActivityExpand>;
export type ActivityStepData = ActivitiesStepsResponse;

class ActivitiesService extends PocketbaseCrud<ActivityData> {
    constructor() {
        super(Collections.Activities, ["name"], ["steps"]);
    }
}

export const activities = new ActivitiesService();