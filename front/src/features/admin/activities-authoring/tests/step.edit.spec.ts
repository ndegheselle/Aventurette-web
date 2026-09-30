import { filesWithinLimit, joinDuration, splitDuration } from '@features/admin/activities-authoring/model/step.edit';
import { aPickedFile } from '@tests';
import { describe, expect, it } from 'vitest';

describe('splitDuration', () => {
    it('splits minutes into hours and minutes', () => {
        expect(splitDuration(95)).toEqual({ hours: 1, minutes: 35 });
    });

    it('reads a step with no duration as zero', () => {
        expect(splitDuration(undefined)).toEqual({ hours: 0, minutes: 0 });
    });
});

describe('joinDuration', () => {
    it('joins hours and minutes back into minutes', () => {
        expect(joinDuration(1, 35)).toBe(95);
    });

    it('counts a cleared input as zero', () => {
        expect(joinDuration('', 20)).toBe(20);
    });

    it('never goes below zero', () => {
        expect(joinDuration(0, -10)).toBe(0);
    });
});

describe('filesWithinLimit', () => {
    it('takes everything when the step has room', () => {
        const { accepted, rejected } = filesWithinLimit([], [aPickedFile(), aPickedFile()], 10);

        expect(accepted).toHaveLength(2);
        expect(rejected).toBe(0);
    });

    it('takes what fits and reports the rest, rather than dropping the whole pick', () => {
        const { accepted, rejected } = filesWithinLimit(['one'], [aPickedFile(), aPickedFile()], 2);

        expect(accepted).toHaveLength(1);
        expect(rejected).toBe(1);
    });

    it('takes nothing once the step is full', () => {
        const { accepted, rejected } = filesWithinLimit(['one', 'two'], [aPickedFile()], 2);

        expect(accepted).toEqual([]);
        expect(rejected).toBe(1);
    });
});
