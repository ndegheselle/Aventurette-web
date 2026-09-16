export class NotImplementedError extends Error { }
export class NotAuthentifiedError extends Error { }

/** Backend error codes keyed by field name. The UI turns each code into a message. */
export type FieldErrors = Record<string, { code?: string }>;

/** A rejected write. Adapters map their own transport errors into this. */
export class ValidationError extends Error {
    readonly fields: FieldErrors;

    constructor(fields: FieldErrors = {}, message: string = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
        this.fields = fields;
    }
}
