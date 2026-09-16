import { activityMapper, materialsOf, resourcesOf } from '@features/activities/model/activity';
import {
    aBenefit,
    aBenefitPayload,
    aMaterial,
    aMaterialPayload,
    aResource,
    aResourcePayload,
    aStep,
    aStepPayload,
    anActivity,
    anActivityPayload,
    fakeFileUrls,
} from '@tests';
import { describe, expect, it } from 'vitest';

const files = fakeFileUrls();

describe('activityMapper', () => {
    it('asks for the nested relations its steps need, so a step arrives whole', () => {
        expect(activityMapper.relations)
            .toEqual(['benefits', 'steps', 'steps.materials', 'steps.resources']);
    });

    it('inlines a relation of a relation, down to the file urls under it', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            benefits: ['bnf1'],
            steps: ['stp1'],
            expand: {
                benefits: [aBenefitPayload({ name: 'Coordination' })],
                steps: [aStepPayload({
                    id: 'stp1',
                    materials: ['mat1'],
                    resources: ['res1'],
                    expand: {
                        materials: [aMaterialPayload({ name: 'Rope' })],
                        resources: [aResourcePayload({ id: 'res1', file: 'rules.pdf' })],
                    },
                })],
            },
        }), files);

        expect(activity.benefits.map(benefit => benefit.name)).toEqual(['Coordination']);
        expect(activity.steps[0]!.materials.map(material => material.name)).toEqual(['Rope']);
        expect(activity.steps[0]!.resources[0]!.url).toBe('https://files.test/res1/rules.pdf');
    });

    it('reads a relation the request did not expand as empty', () => {
        const activity = activityMapper.toEntity(anActivityPayload({ benefits: ['bnf1'] }), files);

        expect(activity.benefits).toEqual([]);
        expect(activity).not.toHaveProperty('expand');
    });

    it('writes relations as ids — saving an activity links its steps, it does not save them', () => {
        const payload = activityMapper.toPayload({
            name: 'Treasure hunt',
            benefits: [aBenefit({ id: 'bnf1' })],
            steps: [aStep({ id: 'stp1' })],
        });

        expect(payload).toEqual({ name: 'Treasure hunt', benefits: ['bnf1'], steps: ['stp1'] });
    });

    it('leaves out a relation the caller did not mention, so an update stays partial', () => {
        expect(activityMapper.toPayload({ state: 'PUBLISHED' })).toEqual({ state: 'PUBLISHED' });
    });
});

// Materials and resources hang off steps, not off the activity: gathering them is the one
// decision in the model worth a test.

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
