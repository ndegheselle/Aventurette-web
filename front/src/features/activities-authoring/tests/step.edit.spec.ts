import { filesWithinLimit } from '@features/activities-authoring/model/step.edit';
import { aPickedFile } from '@tests';
import { describe, expect, it } from 'vitest';

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
