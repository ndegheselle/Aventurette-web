import { usePocketBaseCached, type CachedState } from "@chapelure/api/pocketbase.cached";
import { Collections, type ActivitiesMaterialsResponse } from "@shared/types.g.ts";

export type ActivityMaterialData = ActivitiesMaterialsResponse;

const state: CachedState<ActivityMaterialData> = {
    cache: [],
    isLoaded: false,
    loadPromise: null
}

export function useMaterials()
{
    return usePocketBaseCached<ActivityMaterialData>(state, Collections.ActivitiesMaterials);
}