import type { InterestsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { InterestData } from "@features/users/model/interest";

export type InterestPayload = InterestsResponse;

export const interestMapper: EntityMapper<InterestPayload, InterestData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...interest }) => interest,
    toPayload: (interest) => interest,
};
