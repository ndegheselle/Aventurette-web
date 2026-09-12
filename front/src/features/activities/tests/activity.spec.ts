import { materialsOf, resourcesOf } from '@features/activities/model/activity';
import { aMaterial, aResource, aStep, anActivity } from '@tests';
import { describe, expect, it } from 'vitest';

// Materials and resources hang off steps, not off the activity, so the detail screen has to
// gather them — which is the one decision in this file worth a test.

describe('materialsOf', () => {
    it('gathers what the steps need, since materials hang off steps not activities', () => {
        const activity = anActivity({
            steps: [aStep({ materials: [aMaterial({ name: 'Rope' })] }),
                    aStep({ materials: [aMaterial({ name: 'Chalk' })] })],
        });

        expect(materialsOf(activity).map(material => material.name)).toEqual(['Rope', 'Chalk']);
    });

    it('lists a material two steps share once, in first-use order', () => {
        const rope = aMaterial({ name: 'Rope' });
        const chalk = aMaterial({ name: 'Chalk' });
        const activity = anActivity({
            steps: [aStep({ materials: [chalk, rope] }), aStep({ materials: [{ ...rope }] })],
        });

        expect(materialsOf(activity).map(material => material.name)).toEqual(['Chalk', 'Rope']);
    });

    it('is empty for an activity that has not loaded yet', () => {
        expect(materialsOf(null)).toEqual([]);
        expect(materialsOf(undefined)).toEqual([]);
    });
});

describe('resourcesOf', () => {
    it('gathers the files attached to the steps, deduplicated the same way', () => {
        const sheet = aResource({ name: 'Rules' });
        const activity = anActivity({
            steps: [aStep({ resources: [sheet] }), aStep({ resources: [{ ...sheet }] })],
        });

        expect(resourcesOf(activity)).toHaveLength(1);
    });
});
