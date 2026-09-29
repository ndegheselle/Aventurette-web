import {
    ActivitiesStepsEndCriteriaOptions,
    ActivitiesStepsKindOptions,
    type ActivitiesStepsResponse,
    type StepsResourcesResponse,
} from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/model/material";

// ── The step ────────────────────────────────────────────────────────────────────────────────

/**
 * One step of the activity: what the animator does, as short actions to tick, how long it takes,
 * and the brief of the one visual illustrating it. `materials` are the activity's own, recalled
 * here.
 */
export type ActivityStepData = Entity<ActivitiesStepsResponse<string[]>, {
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
    actions: string[];
}>;

export const StepKind = ActivitiesStepsKindOptions;
export type StepKind = ActivitiesStepsKindOptions;

export const EndCriterion = ActivitiesStepsEndCriteriaOptions;
export type EndCriterion = ActivitiesStepsEndCriteriaOptions;

/** Only the step announcing the end says what ends the activity. */
export function hasEndCriteria(step: Pick<ActivityStepData, 'kind'>): boolean {
    return step.kind === StepKind.ANNOUNCE_END;
}

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
