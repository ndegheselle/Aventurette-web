import type { ActivitiesStepsResponse, StepsMaterialsResponse, StepsResourcesResponse } from "@/backend/schema.g";
import type { Entity, EntityMapper } from "@chapelure/core";

/** A material as the backend stores it. */
export type ActivityMaterialPayload = StepsMaterialsResponse;

/** A material belongs to one step — `step` is its owner, never a catalogue entry. */
export type ActivityMaterialData = Entity<ActivityMaterialPayload>;

export const materialMapper: EntityMapper<ActivityMaterialPayload, ActivityMaterialData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...material }) => material,
    toPayload: (material) => material,
};

/**
 * A resource as the backend stores it. `file` is the stored file's name coming back and the
 * upload itself going up — the asymmetry the entity's `url` exists to hide.
 */
export type ActivityResourcePayload = Omit<StepsResourcesResponse, 'file'> & { file?: string | File };

/** A file uploaded for one step. */
export type ActivityResourceData = Entity<ActivityResourcePayload, {
    /** Where the stored file can be read. Empty until the upload comes back. */
    url: string;
    /** The picked file, on its way up. Set on a create and never after. */
    file?: File;
}>;

export const resourceMapper: EntityMapper<ActivityResourcePayload, ActivityResourceData> = {
    relations: [],
    toEntity: ({ expand: _expand, file, ...resource }, files) => ({
        ...resource,
        url: typeof file === 'string' && file ? files.getUrl(resource, file) : '',
    }),
    toPayload: ({ url: _url, ...resource }) => resource,
};

/** A step as the backend stores it, with what an expanded read carries alongside. */
export type ActivityStepPayload = ActivitiesStepsResponse<{
    materials?: ActivityMaterialPayload[];
    resources?: ActivityResourcePayload[];
}>;

export type ActivityStepData = Entity<ActivitiesStepsResponse, {
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
}>;

export const stepMapper: EntityMapper<ActivityStepPayload, ActivityStepData> = {
    relations: ["materials", "resources"],
    toEntity: ({ expand, ...step }, files) => ({
        ...step,
        materials: (expand?.materials ?? []).map(material => materialMapper.toEntity(material, files)),
        resources: (expand?.resources ?? []).map(resource => resourceMapper.toEntity(resource, files)),
    }),
    toPayload: ({ materials, resources, ...step }) => ({
        ...step,
        ...(materials && { materials: materials.map(material => material.id) }),
        ...(resources && { resources: resources.map(resource => resource.id) }),
    }),
};

/** What an empty rich-text field holds — the collection requires a value. */
export const EMPTY_DESCRIPTION = "<p></p>";

/** How many files one step may carry. Also what the input's constraints line names. */
export const MAX_STEP_RESOURCES = 10;

/** File types accepted for a step resource, in `<input accept>` syntax. */
export const ACCEPTED_RESOURCE_TYPES = '.png,.jpeg,.jpg,.pdf';

/**
 * A blank step, written the moment one is added. `description` and `activity` are seeded
 * because the collection requires both, and the step exists before it is filled in.
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
 * The names to offer for a step's materials: distinct names used anywhere, minus the ones this
 * step has, narrowed by what the user typed. Picking one writes a new row rather than linking
 * someone else's.
 *
 * Matched case-insensitively; the first spelling seen is the one offered.
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
 * Whether what the user typed is worth offering to create — not when the step already has it,
 * and not when it is already a suggestion.
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

/** Comparison key: two spellings of the same material share one. */
function key(name: string | undefined): string {
    return (name ?? "").trim().toLowerCase();
}
