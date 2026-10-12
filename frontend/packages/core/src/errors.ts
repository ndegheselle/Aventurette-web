export class NotImplementedError extends Error { }
export class NotAuthenticatedError extends Error { }

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

/** A rejected batch: nothing of it was written. `fields` are the failed write's own. */
export class BatchError extends ValidationError {
    /** The failed write's place in the batch, from 0, in the order the writes were queued. */
    readonly index: number;

    constructor(index: number, fields: FieldErrors = {}, message: string = 'Batch failed') {
        super(fields, message);
        this.name = 'BatchError';
        this.index = index;
    }
}
