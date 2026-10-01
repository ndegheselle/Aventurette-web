import {
    ActivitiesStepsKindOptions,
    type ActivitiesStepsResponse,
    type StepsResourcesResponse,
} from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/model/material";

// ── The step ────────────────────────────────────────────────────────────────────────────────

/**
 * One step of the activity: what the animator does, as short actions to tick, and how long it
 * takes. `materials` are the activity's own, recalled here.
 */
export type ActivityStepData = Entity<Omit<ActivitiesStepsResponse<string[]>, StepColumnSetAside>, {
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
    actions: string[];
}>;

/**
 * Columns the collection still has and the app no longer reads or writes: the brief of the step's
 * visual, until visuals are handled properly, and the end criteria of a kind that is gone.
 */
export type StepColumnSetAside = 'visual_brief' | 'end_criteria' | 'end_criteria_other';

export const StepKind = ActivitiesStepsKindOptions;
export type StepKind = ActivitiesStepsKindOptions;

/** A step's position as the list shows it: `01`, `02`… from its zero-based index. */
export function stepNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
}

// ── Its resources ───────────────────────────────────────────────────────────────────────────

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
