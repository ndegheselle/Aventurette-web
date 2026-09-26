import { ValidationError } from '@chapelure/core';
import { withSetup } from '@tests';
import { describe, expect, it } from 'vitest';
import { useValidationErrors } from './useValidationErrors';

function setup(defaultKey?: string) {
    const [errors] = withSetup(() => useValidationErrors(defaultKey));
    return errors;
}

describe('useValidationErrors', () => {
    it('starts clean', () => {
        const errors = setup();

        expect(errors.properties.value).toBeNull();
        expect(errors.global.value).toBeUndefined();
        expect(errors.get('email')).toBeUndefined();
    });

    it('translates a field code into the message for that code', () => {
        const errors = setup();

        errors.set(new ValidationError({ email: { code: 'validation_invalid_email' } }));

        expect(errors.get('email')).toBe('Invalid email, or already in use.');
    });

    it('has nothing to say about a field the backend did not reject', () => {
        const errors = setup();

        errors.set(new ValidationError({ email: { code: 'validation_required' } }));

        expect(errors.get('password')).toBeUndefined();
    });

    it('sets a global message so a failure is visible even with no field detail', () => {
        const errors = setup();

        errors.set(new Error('network down'));

        expect(errors.global.value).toBe('Something went wrong.');
        expect(errors.properties.value).toBeNull();
    });

    it('uses the caller\'s own default message when given one', () => {
        const errors = setup('auth.login.defaultError');

        errors.set(new Error('nope'));

        expect(errors.global.value).toBe('Wrong credentials.');
    });

    it('clears everything on reset, so a retry starts from a clean form', () => {
        const errors = setup();
        errors.set(new ValidationError({ email: { code: 'validation_required' } }));

        errors.reset();

        expect(errors.properties.value).toBeNull();
        expect(errors.global.value).toBeUndefined();
        expect(errors.get('email')).toBeUndefined();
    });

    it('replaces the previous failure rather than accumulating', () => {
        const errors = setup();

        errors.set(new ValidationError({ email: { code: 'validation_required' } }));
        errors.set(new ValidationError({ password: { code: 'validation_required' } }));

        expect(errors.get('email')).toBeUndefined();
        expect(errors.get('password')).toBeDefined();
    });
});
