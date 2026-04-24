import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import { type ActivitiesResponse, Collections } from "@shared/types.g.ts";

export type ActivityData = ActivitiesResponse;

class ActivitiesService extends PocketbaseCrud<ActivityData> {
    constructor() {
        super(Collections.Activities, ["name"]);
    }
}

export const activities = new ActivitiesService();