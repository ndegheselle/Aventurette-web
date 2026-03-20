import { PocketbaseCrud } from "@common/database/pocketbase.ts";
import { type InterestsResponse, Collections } from "@common/database/types.g.ts";

export type InterestData = InterestsResponse;

class InterestsService extends PocketbaseCrud<InterestData> {
    constructor() {
        super(Collections.Interests);
    }
}

export const interests = new InterestsService();