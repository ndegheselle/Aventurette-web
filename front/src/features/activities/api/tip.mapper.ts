import type { CatalogTipsResponse } from "@/backend/schema.g";
import { plainMapper, type EntityMapper } from "@chapelure/core";
import type { ActivityTipData } from "@features/activities/model/activity";

/** A tip as the backend stores it. */
export type ActivityTipPayload = CatalogTipsResponse;

export const tipMapper: EntityMapper<ActivityTipPayload, ActivityTipData> = plainMapper<ActivityTipPayload>();
