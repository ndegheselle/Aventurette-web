import type { ChildrensResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { interestMapper, type InterestPayload } from "@features/users/api/interest.mapper";
import type { ChildrenData } from "@features/users/model/child";

/** A child as the backend stores it, with what an expanded read carries alongside. */
export type ChildPayload = ChildrensResponse<{ interests?: InterestPayload[] }>;

export const childMapper: EntityMapper<ChildPayload, ChildrenData> = {
    relations: ["interests"],
    toEntity: ({ expand, ...child }, files) => ({
        ...child,
        interests: (expand?.interests ?? []).map(interest => interestMapper.toEntity(interest, files)),
    }),
    toPayload: ({ interests, ...child }) => ({
        ...child,
        ...(interests && { interests: interests.map(interest => interest.id) }),
    }),
};
