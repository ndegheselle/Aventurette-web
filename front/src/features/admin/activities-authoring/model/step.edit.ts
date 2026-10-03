import type { FieldErrors } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/model/material";
import { StepKind, type ActivityResourceData, type ActivityStepData } from "@features/activities/model/step";

/**
 * The step seen from its author's side: the blank one offered on add, what the collection would
 * refuse in it, and its files. Its shape stays in `activities/model`.
 */

// ── The blank step ──────────────────────────────────────────────────────────────────────────

/**
 * A blank step, for the modal to fill in. Nothing is written until the activity is saved, so the
 * id is chosen here: the activity lists the step, and its files point at it, in that same save.
 */
export function createEmptyStep(id: string, activity: string): ActivityStepData {
    return {
        id,
        activity,
        kind: StepKind.CUSTOM,
        description: "",
        actions: [] as string[],
        materials: [] as ActivityMaterialData[],
        resources: [] as ActivityResourceData[],
    } as ActivityStepData;
}

/**
 * What the collection would refuse in a step, keyed as its errors are. Checked as the modal
 * closes: a refusal at save time would point at the whole save rather than at the field.
 */
export function stepProblems(step: Pick<ActivityStepData, 'description'>): FieldErrors {
    return isBlankHtml(step.description) ? { description: { code: 'validation_required' } } : {};
}

/** Whether rich text holds no text: an editor emptied by hand leaves `<p></p>` behind. */
export function isBlankHtml(html: string | undefined): boolean {
    return !(html ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

// ── Its duration ────────────────────────────────────────────────────────────────────────────

export interface DurationParts {
    hours: number;
    minutes: number;
}

/** A duration in minutes, split for the hours and minutes inputs. */
export function splitDuration(duration: number | undefined): DurationParts {
    const total = duration || 0;
    return { hours: Math.floor(total / 60), minutes: total % 60 };
}

/**
 * The hours and minutes inputs, back in minutes. A cleared input counts as zero, and minutes past
 * 59 carry over — they come back split on the next read.
 */
export function joinDuration(hours: number | string, minutes: number | string): number {
    const total = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
    return Math.max(total, 0);
}

// ── Its files ───────────────────────────────────────────────────────────────────────────────

/** How many files one step may carry. The constraints line in the locales repeats it. */
export const MAX_STEP_RESOURCES = 10;

/**
 * A picked file, as the resource the activity's save will create for it. `url` previews it until
 * then; the stored file's own url replaces it on the next read.
 */
export function createResource(id: string, step: string, file: File, url: string): ActivityResourceData {
    return { id, step, name: file.name, file, url } as ActivityResourceData;
}

/** File types accepted for a step resource, in `<input accept>` syntax. */
export const ACCEPTED_RESOURCE_TYPES = '.png,.jpeg,.jpg,.pdf';

/** How a resource's tile shows it: as a thumbnail, as a document icon, or as any file. */
export type ResourcePreview = 'image' | 'pdf' | 'file';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp']);

export function resourcePreviewOf(resource: Pick<ActivityResourceData, 'url' | 'file'>): ResourcePreview {
    const extension = extensionOf(resource);
    if (IMAGE_EXTENSIONS.has(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'file';
}

// A picked file's preview url is a `blob:` with no extension, so its own name is read instead.
function extensionOf(resource: Pick<ActivityResourceData, 'url' | 'file'>): string {
    const [path = ''] = (resource.file?.name ?? resource.url).split('?');
    return path.split('.').pop()?.toLowerCase() ?? '';
}

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
