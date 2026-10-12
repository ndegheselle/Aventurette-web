import type { ActivitiesWorkshopsResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/model/material";

/**
 * One of the stations an activity runs in parallel, and how many adults it takes to hold it.
 * `materials` are the activity's own, recalled here.
 */
export type ActivityWorkshopData = Entity<ActivitiesWorkshopsResponse, {
    materials: ActivityMaterialData[];
}>;
