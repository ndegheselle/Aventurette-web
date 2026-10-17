import { playStepIndexOf } from '@features/activities/models/play';
import { describe, expect, it } from 'vitest';

describe('playStepIndexOf', () => {
    it('reads the 1-based step of the route as an index', () => {
        expect(playStepIndexOf('2', 3)).toBe(1);
    });

    it('starts at the first step without a readable param', () => {
        expect(playStepIndexOf(undefined, 3)).toBe(0);
        expect(playStepIndexOf('abc', 3)).toBe(0);
        expect(playStepIndexOf('1.5', 3)).toBe(0);
    });

    it('keeps a step past either end within the run', () => {
        expect(playStepIndexOf('0', 3)).toBe(0);
        expect(playStepIndexOf('99', 3)).toBe(2);
        expect(playStepIndexOf('2', 0)).toBe(0);
    });
});
