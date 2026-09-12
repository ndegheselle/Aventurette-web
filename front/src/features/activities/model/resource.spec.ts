import { aPickedFile, aResource } from '@tests';
import { describe, expect, it } from 'vitest';
import { filesWithinLimit, MAX_STEP_RESOURCES } from './resource';

describe('filesWithinLimit', () => {
    it('takes the pick whole when the step has room for it', () => {
        const { accepted, rejected } = filesWithinLimit([], [aPickedFile('map.png')]);

        expect(accepted.map(file => file.name)).toEqual(['map.png']);
        expect(rejected).toBe(0);
    });

    it('counts what the step already carries against the limit', () => {
        const { accepted, rejected } = filesWithinLimit([aResource()], [aPickedFile('map.png')], 2);

        expect(accepted).toHaveLength(1);
        expect(rejected).toBe(0);
    });

    it('takes the files that fit and reports the rest, rather than dropping the whole pick', () => {
        const files = [aPickedFile('a.png'), aPickedFile('b.png'), aPickedFile('c.png')];

        const { accepted, rejected } = filesWithinLimit([], files, 2);

        expect(accepted.map(file => file.name)).toEqual(['a.png', 'b.png']);
        expect(rejected).toBe(1);
    });

    it('takes nothing once the step is full', () => {
        const full = [aResource(), aResource()];

        const { accepted, rejected } = filesWithinLimit(full, [aPickedFile('a.png')], 2);

        expect(accepted).toEqual([]);
        expect(rejected).toBe(1);
    });

    it('does not go negative when the step is somehow over the limit', () => {
        const over = [aResource(), aResource(), aResource()];

        const { accepted, rejected } = filesWithinLimit(over, [aPickedFile('a.png')], 2);

        expect(accepted).toEqual([]);
        expect(rejected).toBe(1);
    });

    it('defaults to the documented limit', () => {
        const files = Array.from({ length: MAX_STEP_RESOURCES + 2 }, (_, i) => aPickedFile(`f${i}.png`));

        const { accepted, rejected } = filesWithinLimit([], files);

        expect(accepted).toHaveLength(MAX_STEP_RESOURCES);
        expect(rejected).toBe(2);
    });
});
