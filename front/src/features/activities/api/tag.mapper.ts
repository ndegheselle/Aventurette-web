import type { ActivitiesTagsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { ActivityTagData, Translated } from "@features/activities/model/tag";

/** A tag as the backend stores it, its JSON columns typed as the wordings they hold. */
export type ActivityTagPayload = ActivitiesTagsResponse<Translated, Translated>;

export const tagMapper: EntityMapper<ActivityTagPayload, ActivityTagData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...tag }) => tag,
    toPayload: (tag) => tag,
};
