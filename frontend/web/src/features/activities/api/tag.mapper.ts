import type { CatalogTagsResponse } from "@/backend/schema.g";
import { plainMapper, type EntityMapper } from "@chapelure/core";
import type { ActivityTagData } from "@features/activities/model/tag";

/** A tag as the backend stores it. */
export type ActivityTagPayload = CatalogTagsResponse;

export const tagMapper: EntityMapper<ActivityTagPayload, ActivityTagData> = plainMapper<ActivityTagPayload>();
