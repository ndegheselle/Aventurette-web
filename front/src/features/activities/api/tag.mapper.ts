import type { CatalogTagsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { omit } from "@chapelure/core";
import type { ActivityTagData } from "@features/activities/model/tag";

/** A tag as the backend stores it. */
export type ActivityTagPayload = CatalogTagsResponse;

export const tagMapper: EntityMapper<ActivityTagPayload, ActivityTagData> = {
    relations: [],
    toEntity: (tag) => omit(tag, "expand"),
    toPayload: (tag) => tag,
};
