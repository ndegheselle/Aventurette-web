import type { ActivitiesWorkshopsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { materialMapper, type ActivityMaterialPayload } from "@features/activities/api/material.mapper";
import type { ActivityWorkshopData } from "@features/activities/model/workshop";

/** A workshop as the backend stores it, with what an expanded read carries alongside. */
export type ActivityWorkshopPayload = ActivitiesWorkshopsResponse<{
    materials?: ActivityMaterialPayload[];
}>;

export const workshopMapper: EntityMapper<ActivityWorkshopPayload, ActivityWorkshopData> = {
    relations: ["materials"],
    toEntity: ({ expand, ...workshop }, files) => ({
        ...workshop,
        materials: (expand?.materials ?? []).map(material => materialMapper.toEntity(material, files)),
    }),
    toPayload: ({ materials, ...workshop }) => ({
        ...workshop,
        ...(materials && { materials: materials.map(material => material.id) }),
    }),
};
