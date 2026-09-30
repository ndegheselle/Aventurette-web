import type { TagsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { ActivityTagData } from "@features/activities/model/tag";

/** A tag as the backend stores it. */
export type ActivityTagPayload = TagsResponse;

export const tagMapper: EntityMapper<ActivityTagPayload, ActivityTagData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...tag }) => tag,
    toPayload: (tag) => tag,
};
