import { PocketbaseCrud } from "@common/database/pocketbase.ts";
import { type FamiliesResponse, Collections } from "@common/database/types.g.ts";

export type FamilyData = FamiliesResponse;

class FamiliesService extends PocketbaseCrud<FamilyData> {
    constructor() {
        super(Collections.Families);
    }

    async getByUser(userId: string) : Promise<FamilyData | null>
    {
        var result = await this.collection.getList<FamilyData>(1, 1, {filter: `user=${userId}`});
        if (!result.items[0])
            return null;
        return result.items[0] ?? null;
    }
}

export const families = new FamiliesService();