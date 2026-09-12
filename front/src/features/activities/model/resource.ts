import {
    isUploadedResource,
    type NewActivityResourceData,
    type StepResourceData,
} from "@features/activities/model/activity";

/** How many files one step may carry. Referenced by the constraints line the input shows. */
export const MAX_STEP_RESOURCES = 10;

/** What the file types accepted for a step resource are, in `<input accept>` syntax. */
export const ACCEPTED_RESOURCE_TYPES = '.png,.jpeg,.jpg,.pdf';

export interface ResourceAddition {
    /** The step's resources with as many of the new files appended as there was room for. */
    resources: StepResourceData[];
    /** How many files did not fit. Zero when everything was taken. */
    rejected: number;
}

/**
 * Append picked files to a step's resources, up to the limit.
 *
 * Over the limit, the files that fit are still taken and the rest reported — dropping the whole
 * pick because the last file did not fit would be worse than partial success.
 *
 * The caller has already had the files validated for type and size by `<FilesInput>`; what is
 * left is the count, which only the step knows.
 */
export function addResourcesWithinLimit(
    current: StepResourceData[],
    added: File[],
    max: number = MAX_STEP_RESOURCES,
): ResourceAddition {
    const room = Math.max(max - current.length, 0);
    const accepted = added.slice(0, room);

    return {
        resources: accepted.length ? [...current, ...accepted.map(toNewResource)] : current,
        rejected: added.length - accepted.length,
    };
}

/** A file the user just picked, as a resource the step can carry until it is saved. */
function toNewResource(file: File): NewActivityResourceData {
    return { file, name: file.name };
}

/**
 * A stable key per resource for list rendering.
 *
 * A saved resource has an id; one waiting to be uploaded does not, so its filename stands in.
 */
export function resourceKey(resource: StepResourceData): string {
    return isUploadedResource(resource) ? resource.id : resource.file.name;
}
