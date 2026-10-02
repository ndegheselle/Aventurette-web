import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { tipMapper } from "@features/activities/api/tip.mapper";
import type { ActivityTipData } from "@features/activities/model/activity";

const tips = crud(Collections.CatalogTips, tipMapper);

// A catalogue the editor picks from, as safety instructions are: a new tip is added from the
// Dashboard.
export const tipsApi = {
    getAll(): Promise<ActivityTipData[]> {
        return tips.getAll();
    },
};
