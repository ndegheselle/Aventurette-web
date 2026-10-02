import type { CatalogTipsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { omit } from "@chapelure/core";
import type { ActivityTipData } from "@features/activities/model/activity";

/** A tip as the backend stores it. */
export type ActivityTipPayload = CatalogTipsResponse;

export const tipMapper: EntityMapper<ActivityTipPayload, ActivityTipData> = {
    relations: [],
    toEntity: (tip) => omit(tip, "expand"),
    toPayload: (tip) => tip,
};
