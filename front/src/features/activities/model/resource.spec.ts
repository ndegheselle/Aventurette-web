import { aPickedFile, aResource } from '@tests';
import { describe, expect, it } from 'vitest';
import type { StepResourceData } from './activity';
import { addResourcesWithinLimit, MAX_STEP_RESOURCES, resourceKey } from './resource';

describe('addResourcesWithinLimit', () => {
    it('appends the picked files as resources named after them', () => {
        const { resources, rejected } = addResourcesWithinLimit([], [aPickedFile('map.png')]);

        expect(resources).toEqual([{ file: expect.any(File), name: 'map.png' }]);
        expect(rejected).toBe(0);
    });

    it('keeps what the step already had', () => {
        const existing = aResource();

        const { resources } = addResourcesWithinLimit([existing], [aPickedFile('map.png')]);

        expect(resources[0]).toBe(existing);
        expect(resources).toHaveLength(2);
    });

    it('takes the files that fit and reports the rest, rather than dropping the whole pick', () => {
        const files = [aPickedFile('a.png'), aPickedFile('b.png'), aPickedFile('c.png')];

        const { resources, rejected } = addResourcesWithinLimit([], files, 2);

        expect(resources.map(r => r.name)).toEqual(['a.png', 'b.png']);
        expect(rejected).toBe(1);
    });

    it('takes nothing once the step is full', () => {
        const full = [aResource(), aResource()];

        const { resources, rejected } = addResourcesWithinLimit(full, [aPickedFile('a.png')], 2);

        expect(resources).toBe(full);
        expect(rejected).toBe(1);
    });

    it('does not go negative when the step is somehow over the limit', () => {
        const over = [aResource(), aResource(), aResource()];

        const { resources, rejected } = addResourcesWithinLimit(over, [aPickedFile('a.png')], 2);

        expect(resources).toBe(over);
        expect(rejected).toBe(1);
    });

    it('leaves the original list alone', () => {
        const existing: StepResourceData[] = [aResource()];

        addResourcesWithinLimit(existing, [aPickedFile('a.png')]);

        expect(existing).toHaveLength(1);
    });

    it('defaults to the documented limit', () => {
        const files = Array.from({ length: MAX_STEP_RESOURCES + 2 }, (_, i) => aPickedFile(`f${i}.png`));

        const { resources, rejected } = addResourcesWithinLimit([], files);

        expect(resources).toHaveLength(MAX_STEP_RESOURCES);
        expect(rejected).toBe(2);
    });
});

describe('resourceKey', () => {
    it('uses the record id for a saved resource', () => {
        const saved = aResource();

        expect(resourceKey(saved)).toBe(saved.id);
    });

    it('falls back to the filename for one not uploaded yet', () => {
        expect(resourceKey({ file: aPickedFile('map.png'), name: 'map.png' })).toBe('map.png');
    });
});
