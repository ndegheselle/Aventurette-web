import type { ActivitiesStepsResponse, StepsMaterialsResponse, StepsResourcesResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

/** A material belongs to one step. */
export type ActivityMaterialData = Entity<StepsMaterialsResponse>;

/**
 * A file uploaded for one step. A picked file is uploaded the moment it is chosen, so what the
 * app holds is always a record — see `step.mapper.ts` for the two sides of `file`.
 */
export type ActivityResourceData = Entity<Omit<StepsResourcesResponse, 'file'>, {
    /** Where the stored file can be read. Empty until the upload comes back. */
    url: string;
    /** The picked file, on its way up. Set on a create and never after. */
    file?: File;
}>;

export type ActivityStepData = Entity<ActivitiesStepsResponse, {
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
}>;
