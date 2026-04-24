import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import { type InterestsResponse, Collections } from "@shared/types.g.ts";

export type InterestData = InterestsResponse;

class InterestsService extends PocketbaseCrud<InterestData> {
    constructor() {
        super(Collections.Interests);
    }
}

export const interests = new InterestsService();