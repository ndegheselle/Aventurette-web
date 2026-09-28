import type { ActivityMaterialData } from "@features/activities/model/material";
import { StepKind, type ActivityResourceData, type ActivityStepData } from "@features/activities/model/step";

/**
 * The step seen from its author's side: the blank one written on add, and how many files it
 * takes. Its shape stays in `activities/model`.
 */

// ── The blank step ──────────────────────────────────────────────────────────────────────────

/**
 * A blank step, written the moment one is added. `description`, `kind` and `activity` are seeded
 * because the collection requires them, and the step exists before it is filled in.
 */
export function createEmptyStep(activity: string): ActivityStepData {
    return {
        activity,
        kind: StepKind.CUSTOM,
        description: "",
        actions: [] as string[],
        materials: [] as ActivityMaterialData[],
        resources: [] as ActivityResourceData[],
    } as ActivityStepData;
}

// ── Its files ───────────────────────────────────────────────────────────────────────────────

/** How many files one step may carry. The constraints line in the locales repeats it. */
export const MAX_STEP_RESOURCES = 10;

/** File types accepted for a step resource, in `<input accept>` syntax. */
export const ACCEPTED_RESOURCE_TYPES = '.png,.jpeg,.jpg,.pdf';

export interface AcceptedFiles {
    /** As many of the picked files as the step had room for. */
    accepted: File[];
    /** How many did not fit. Zero when everything was taken. */
    rejected: number;
}

/**
 * Split a pick into what the step can still take and what it cannot — over the limit, the files
 * that fit are kept and the rest reported.
 *
 * Type and size are `<FilesInput>`'s to validate; only the step knows the count.
 */
export function filesWithinLimit(
    current: unknown[],
    picked: File[],
    max: number = MAX_STEP_RESOURCES,
): AcceptedFiles {
    const room = Math.max(max - current.length, 0);
    const accepted = picked.slice(0, room);

    return { accepted, rejected: picked.length - accepted.length };
}
