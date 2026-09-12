import { ValidationError } from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { mapErrors, toValidationError } from './errors';

/** The shape the PocketBase SDK throws: a status, plus per-field detail under response.data. */
function aPocketBaseError(fields: Record<string, { code?: string }>, message = 'Failed to create record.') {
    return { status: 400, message, response: { data: fields } };
}

describe('toValidationError', () => {
    it('carries the per-field codes across, so the form can mark its inputs', () => {
        const error = toValidationError(aPocketBaseError({ email: { code: 'validation_invalid_email' } }));

        expect(error).toBeInstanceOf(ValidationError);
        expect(error?.fields).toEqual({ email: { code: 'validation_invalid_email' } });
        expect(error?.message).toBe('Failed to create record.');
    });

    it('is a ValidationError with no fields when the backend sent no detail', () => {
        expect(toValidationError({ status: 500, message: 'Something went wrong' })?.fields).toEqual({});
    });

    it.each([
        ['a network failure', new Error('Failed to fetch')],
        ['an abort', { name: 'AbortError' }],
        ['a string', 'boom'],
        ['nothing', undefined],
        ['null', null],
    ])('leaves %s alone, so it is not mislabelled as a validation failure', (_label, thrown) => {
        expect(toValidationError(thrown)).toBeUndefined();
    });
});

describe('mapErrors', () => {
    it('passes a successful call straight through', async () => {
        await expect(mapErrors(async () => 'ok')).resolves.toBe('ok');
    });

    it('normalises a PocketBase rejection', async () => {
        const failing = () => Promise.reject(aPocketBaseError({ name: { code: 'validation_required' } }));

        await expect(mapErrors(failing)).rejects.toBeInstanceOf(ValidationError);
    });

    it('rethrows anything that is not a PocketBase response, unchanged', async () => {
        const boom = new Error('Failed to fetch');

        await expect(mapErrors(() => Promise.reject(boom))).rejects.toBe(boom);
    });
});
