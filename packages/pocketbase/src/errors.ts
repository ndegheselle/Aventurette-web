import { ValidationError, type FieldErrors } from '@chapelure/core';
import type { ClientResponseError } from 'pocketbase';

/**
 * Translate a PocketBase transport error into the backend-neutral ValidationError.
 *
 * Returns undefined for anything that is not a PocketBase response error (network failures,
 * aborts, programming errors) so callers can rethrow those untouched rather than mislabel them.
 */
export function toValidationError(error: unknown): ValidationError | undefined {
    if (!error || typeof error !== 'object') return undefined;

    const response = error as Partial<ClientResponseError>;
    if (typeof response.status !== 'number') return undefined;

    // PocketBase nests per-field errors under response.data (aliased as .data.data on the error).
    const fields = (response.response?.data ?? {}) as FieldErrors;
    return new ValidationError(fields, response.message);
}

/** Run a PocketBase call, normalising any validation failure on the way out. */
export async function mapErrors<T>(call: () => Promise<T>): Promise<T> {
    try {
        return await call();
    } catch (error) {
        throw toValidationError(error) ?? error;
    }
}
