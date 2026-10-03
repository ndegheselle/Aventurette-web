import { ValidationError, type FieldErrors } from '@chapelure/core';
import type { ClientResponseError } from 'pocketbase';

/** The status PocketBase answers a refused write with: a field failed a rule, or a login failed. */
const BAD_REQUEST = 400;

/** What PocketBase answers for an id it has no record under, or one the caller may not read. */
export const NOT_FOUND = 404;

/** The status of a PocketBase response error, or undefined for anything else. */
export function statusOf(error: unknown): number | undefined {
    if (!error || typeof error !== 'object') return undefined;

    const { status } = error as Partial<ClientResponseError>;
    return typeof status === 'number' ? status : undefined;
}

/**
 * Translate a PocketBase refusal into a ValidationError. Undefined for any other failure — a
 * missing record, a forbidden call, a server error, and network failures and aborts, which the
 * SDK reports with status 0 — so those are rethrown untouched.
 */
export function toValidationError(error: unknown): ValidationError | undefined {
    if (statusOf(error) !== BAD_REQUEST) return undefined;

    const response = error as Partial<ClientResponseError>;
    // PocketBase nests per-field errors under response.data.
    const fields = (response.response?.data ?? {}) as FieldErrors;
    return new ValidationError(fields, response.message);
}

/** Run a PocketBase call, normalising a refusal on the way out. */
export async function mapErrors<T>(call: () => Promise<T>): Promise<T> {
    try {
        return await call();
    } catch (error) {
        throw toValidationError(error) ?? error;
    }
}
