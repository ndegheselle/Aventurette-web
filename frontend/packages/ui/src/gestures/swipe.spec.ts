import { describe, expect, it } from 'vitest';
import { distanceAlong, shouldCommit } from './swipe';

describe('distanceAlong', () => {
    it.each([
        ['down', 5, 30, 30],
        ['up', 5, 30, -30],
        ['right', 30, 5, 30],
        ['left', 30, 5, -30]
    ] as const)('measures a %s swipe', (direction, dx, dy, expected) => {
        expect(distanceAlong(direction, dx, dy)).toBe(expected);
    });
});

describe('shouldCommit', () => {
    it('commits once moved past 30% of the element', () => {
        expect(shouldCommit(301, 1000, 0)).toBe(true);
    });

    it('snaps back when moved less, slowly', () => {
        expect(shouldCommit(100, 1000, 0.1)).toBe(false);
    });

    it('commits on a flick, even a short one', () => {
        expect(shouldCommit(60, 1000, 1)).toBe(true);
    });

    it('ignores a fast twitch of a few pixels', () => {
        expect(shouldCommit(5, 1000, 2)).toBe(false);
    });

    it('never commits when not moved along the direction', () => {
        expect(shouldCommit(0, 1000, 5)).toBe(false);
    });

    it('takes its own thresholds', () => {
        expect(shouldCommit(60, 1000, 0, { ratio: 0.05, flickVelocity: 1, flickMinOffset: 10 })).toBe(true);
    });
});
