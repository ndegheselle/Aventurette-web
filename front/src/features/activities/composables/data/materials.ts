import { cachedCrud } from "@/backend";
import { Collections, type ActivitiesMaterialsResponse } from "@/backend/schema.g";

export type ActivityMaterialData = ActivitiesMaterialsResponse;

// Module scope on purpose: one cache shared by every caller.
const repository = cachedCrud<ActivityMaterialData>(Collections.ActivitiesMaterials);

export function useMaterials()
{
    return repository;
}
