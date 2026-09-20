import type { ChildrensResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { ChildrenData } from "@features/users/model/child";

/** A child as the backend stores it. Nothing hangs off one any more. */
export type ChildPayload = ChildrensResponse;

export const childMapper: EntityMapper<ChildPayload, ChildrenData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...child }) => child,
    toPayload: (child) => child,
};
