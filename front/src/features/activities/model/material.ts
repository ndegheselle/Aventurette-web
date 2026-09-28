import type { ActivitiesMaterialsResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

/**
 * Something the activity needs, with how much of it. A material belongs to one activity; its
 * steps and workshops recall the ones they use rather than owning a copy.
 */
export type ActivityMaterialData = Entity<ActivitiesMaterialsResponse>;
