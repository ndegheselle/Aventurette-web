import type { ActivitiesMaterialsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/model/material";

/** A material as the backend stores it. */
export type ActivityMaterialPayload = ActivitiesMaterialsResponse;

export const materialMapper: EntityMapper<ActivityMaterialPayload, ActivityMaterialData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...material }) => material,
    toPayload: (material) => material,
};
