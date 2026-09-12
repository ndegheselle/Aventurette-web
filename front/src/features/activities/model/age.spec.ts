import { describe, expect, it } from 'vitest';
import { formatAgeRange, type Translate } from './age';

/** Renders the key and its params, so the test asserts which message was chosen, not its copy. */
const t: Translate = (key, params) => `${key}(${JSON.stringify(params ?? {})})`;

describe('formatAgeRange', () => {
    it('uses the range message when both bounds are set', () => {
        expect(formatAgeRange(t, 6, 10)).toBe('activities.age.range({"min":6,"max":10})');
    });

    it('uses the minimum-only message when there is no upper bound', () => {
        expect(formatAgeRange(t, 6, null)).toBe('activities.age.minOnly({"min":6})');
    });

    it('uses the maximum-only message when there is no lower bound', () => {
        expect(formatAgeRange(t, null, 10)).toBe('activities.age.maxOnly({"max":10})');
    });

    it('is null when neither bound is set, so the caller can fall back to a label', () => {
        expect(formatAgeRange(t, null, null)).toBeNull();
        expect(formatAgeRange(t, undefined, undefined)).toBeNull();
    });
});
