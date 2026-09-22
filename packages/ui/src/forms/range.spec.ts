import { describe, expect, it } from 'vitest';
import { clampHigh, clampLow, highOf, isLowOnTop, lowOf, percentOf } from './range';

const bounds = { floor: 0, ceiling: 10 };

describe('range', () => {
    it('puts an unset end at its edge', () => {
        expect(lowOf(bounds, null)).toBe(0);
        expect(highOf(bounds, undefined)).toBe(10);
        expect(lowOf(bounds, 3)).toBe(3);
    });

    it('stops each thumb at the other', () => {
        expect(clampLow(7, 5)).toBe(5);
        expect(clampLow(3, 5)).toBe(3);
        expect(clampHigh(2, 4)).toBe(4);
        expect(clampHigh(6, 4)).toBe(6);
    });

    it('keeps the position on the track', () => {
        expect(percentOf(bounds, 5)).toBe(50);
        expect(percentOf(bounds, 20)).toBe(100);
        expect(percentOf({ floor: 5, ceiling: 5 }, 5)).toBe(0);
    });

    it('raises the min thumb once past the middle, so both can leave either edge', () => {
        expect(isLowOnTop(bounds, 10)).toBe(true);
        expect(isLowOnTop(bounds, 0)).toBe(false);
    });
});
