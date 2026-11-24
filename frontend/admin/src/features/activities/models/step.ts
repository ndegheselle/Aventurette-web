import {
    ActivitiesStepsEndCriteriaOptions,
    ActivitiesStepsKindOptions,
    type ActivitiesStepsResponse,
    type CatalogTipsResponse,
    type StepsResourcesResponse,
} from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/models/material";

// ── The step ────────────────────────────────────────────────────────────────────────────────

/**
 * One step of the activity: what the animator does, and how long it takes. `materials` are the activity's own, recalled here; `tips` are the catalogue's, linked.
 *
 * `visual_brief` describes the step's picture, which is not stored yet. `end_criteria` and
 * `end_criteria_other` say when the step stops: the usual reasons, then anything else in words.
 */
export type ActivityStepData = Entity<ActivitiesStepsResponse, {
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
    tips: ActivityTipData[];
}>;

export const StepKind = ActivitiesStepsKindOptions;
export type StepKind = ActivitiesStepsKindOptions;

export const StepEndCriterion = ActivitiesStepsEndCriteriaOptions;
export type StepEndCriterion = ActivitiesStepsEndCriteriaOptions;

/** A step's position as the list shows it: `01`, `02`… from its zero-based index. */
export function stepNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
}

// ── Its tips ────────────────────────────────────────────────────────────────────────────────

/**
 * A piece of advice for running a step. Tips are a catalogue every step draws from, as safety
 * instructions are for activities: a step links the ones it gives, it never writes them.
 */
export type ActivityTipData = Entity<CatalogTipsResponse>;

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

/** What a resource shows as its picture: its own url when it is an image, empty otherwise (a PDF). */
export function pictureOf(resource: ActivityResourceData): string {
    return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(resource.url) ? resource.url : '';
}
