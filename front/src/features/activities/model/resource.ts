/** How many files one step may carry. Referenced by the constraints line the input shows. */
export const MAX_STEP_RESOURCES = 10;

/** What the file types accepted for a step resource are, in `<input accept>` syntax. */
export const ACCEPTED_RESOURCE_TYPES = '.png,.jpeg,.jpg,.pdf';

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
