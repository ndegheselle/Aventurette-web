import type { ActivitiesStepsResponse, StepsMaterialsResponse, StepsResourcesResponse } from "@/backend/schema.g";
import type { Expanded } from "@chapelure/core";

// Relations arrive inlined — `step.materials` holds the materials themselves. What is listed
// here has to match STEP_RELATIONS below; nothing checks that for us.
export type ActivityStepData = Expanded<ActivitiesStepsResponse, {
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
}>;

/** A material belongs to the step that needs it: `step` is what owns this record. */
export type ActivityMaterialData = StepsMaterialsResponse;

/**
 * A resource is always a record: a picked file is uploaded the moment it is chosen, so `file`
 * only ever holds the name of a stored file — never the upload itself. It belongs to the step
 * it was uploaded for, which is what `step` says.
 */
export type ActivityResourceData = StepsResourcesResponse;

/** Relations to fetch alongside a step, and to write back as ids when one is saved. */
export const STEP_RELATIONS = ["materials", "resources"];

/** What a required editor field holds when there is nothing in it yet. */
export const EMPTY_DESCRIPTION = "<p></p>";

/** How many files one step may carry. Referenced by the constraints line the input shows. */
export const MAX_STEP_RESOURCES = 10;

/** What the file types accepted for a step resource are, in `<input accept>` syntax. */
export const ACCEPTED_RESOURCE_TYPES = '.png,.jpeg,.jpg,.pdf';

/**
 * A blank step, written the moment one is added.
 *
 * `description` is seeded because the collection requires it and the step exists before it is
 * filled in. `activity` is the owner the collection requires too — a step is not a
 * free-floating record that an activity later points at.
 */
export function createEmptyStep(activity: string): ActivityStepData {
    return {
        activity,
        description: EMPTY_DESCRIPTION,
        materials: [] as ActivityMaterialData[],
        resources: [] as ActivityResourceData[],
    } as ActivityStepData;
}

/**
 * The names to offer for a step's materials.
 *
 * A material belongs to one step, so the same rope is a row per step and there is no catalogue
 * to pick from. What is worth offering is the distinct *names* already used anywhere, minus the
 * ones this step has, narrowed by what the user typed — picking one writes a new row rather
 * than linking someone else's.
 *
 * Names are matched case-insensitively, and the first spelling seen is the one offered.
 */
export function materialNameSuggestions(
    available: ActivityMaterialData[],
    selected: ActivityMaterialData[],
    search: string = "",
): string[] {
    const taken = new Set(selected.map(material => key(material.name)));
    const term = key(search);
    const names = new Map<string, string>();

    for (const material of available) {
        const name = material.name?.trim();
        if (!name) continue;

        const id = key(name);
        if (taken.has(id) || names.has(id)) continue;
        if (term && !id.includes(term)) continue;

        names.set(id, name);
    }

    return [...names.values()];
}

/**
 * Whether what the user typed is worth offering to create.
 *
 * Not when the step already has that material, and not when it is one of the suggestions —
 * picking that one creates the same row.
 */
export function canCreateMaterial(
    search: string,
    suggestions: string[],
    selected: ActivityMaterialData[],
): boolean {
    const name = key(search);
    if (!name) return false;

    return !suggestions.some(suggestion => key(suggestion) === name)
        && !selected.some(material => key(material.name) === name);
}

export interface AcceptedFiles {
    /** As many of the picked files as the step had room for. */
    accepted: File[];
    /** How many did not fit. Zero when everything was taken. */
    rejected: number;
}

/**
 * How many of the files just picked a step can still take.
 *
 * Over the limit, the files that fit are still taken and the rest reported — dropping the
 * whole pick because the last file did not fit would be worse than partial success.
 *
 * The caller has already had the files validated for type and size by `<FilesInput>`; what is
 * left is the count, which only the step knows.
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

/** What two spellings of the same material have in common. */
function key(name: string | undefined): string {
    return (name ?? "").trim().toLowerCase();
}
