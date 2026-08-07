export class NotImplementedError extends Error { }
export class NotAuthentifiedError extends Error { }

/**
 * Per-field error codes, keyed by field name. Codes are backend-defined strings that the
 * presentation layer turns into messages (typically a translation lookup).
 */
export type FieldErrors = Record<string, { code?: string }>;

/**
 * A rejected write, normalised away from any backend's error shape.
 * Adapters are responsible for mapping their transport errors into this.
 */
export class ValidationError extends Error {
    readonly fields: FieldErrors;

    constructor(fields: FieldErrors = {}, message: string = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
        this.fields = fields;
    }
}
