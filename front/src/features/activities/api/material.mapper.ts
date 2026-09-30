import type { ActivitiesMaterialsResponse, MaterialsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { ActivityMaterialData, MaterialData } from "@features/activities/model/material";

/** A catalogue material as the backend stores it. */
export type MaterialPayload = MaterialsResponse;

export const materialMapper: EntityMapper<MaterialPayload, MaterialData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...material }) => material,
    toPayload: (material) => material,
};

/** An activity's link to a catalogue material, with the material an expanded read carries. */
export type ActivityMaterialPayload = ActivitiesMaterialsResponse<{
    material?: MaterialPayload;
}>;

/**
 * Reads the link with the catalogue material's name folded in, so a list of what an activity
 * needs is one list. The name never goes back: a link writes its ids and its quantity.
 */
export const activityMaterialMapper: EntityMapper<ActivityMaterialPayload, ActivityMaterialData> = {
    relations: ["material"],
    toEntity: ({ expand, ...link }) => ({ ...link, name: expand?.material?.name ?? "" }),
    toPayload: ({ name: _name, ...link }) => link,
};
