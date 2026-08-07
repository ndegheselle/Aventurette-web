import { cachedCrud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { ActivityMaterialData } from "@features/activities/model/material";

// Small reference collection: fetched once, then served from memory.
export const materialsRepository = cachedCrud<ActivityMaterialData>(Collections.ActivitiesMaterials);
