import { materialsOf, resourcesOf } from '@features/activities/model/activity';
import { activityMapper } from '@features/activities/api/activity.mapper';
import {
    aGroup,
    aMaterial,
    aMaterialPayload,
    aResource,
    aResourcePayload,
    aStep,
    aStepPayload,
    anActivity,
    anActivityPayload,
    anAttributeValue,
    aPick,
    fakeFileUrls,
} from '@tests';
import { describe, expect, it } from 'vitest';

const files = fakeFileUrls();

describe('activityMapper', () => {
    it('asks for the nested relations its steps need, so a step arrives whole', () => {
        expect(activityMapper.relations).toEqual([
            'groups',
            'steps',
            'steps.materials',
            'steps.resources',
            'activity_attribute_values_via_activity',
            'activity_attribute_options_via_activity',
        ]);
    });

    it('inlines a relation of a relation, down to the file urls under it', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            groups: ['grp1'],
            steps: ['stp1'],
            expand: {
                groups: [aGroup({ name: 'Général' })],
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

        expect(activity.groups.map(group => group.name)).toEqual(['Général']);
        expect(activity.steps[0]!.materials.map(material => material.name)).toEqual(['Rope']);
        expect(activity.steps[0]!.resources[0]!.url).toBe('https://files.test/res1/rules.pdf');
    });

    it('reads a relation the request did not expand as empty', () => {
        const activity = activityMapper.toEntity(anActivityPayload({ groups: ['grp1'] }), files);

        expect(activity.groups).toEqual([]);
        expect(activity).not.toHaveProperty('expand');
    });

    it('reads the attribute rows that point back at the activity', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            expand: {
                activity_attribute_values_via_activity: [anAttributeValue({ number_value: 45 })],
                activity_attribute_options_via_activity: [aPick({ option: 'opt1' })],
            },
        }) as any, files);

        expect(activity.attributes.map(value => value.number_value)).toEqual([45]);
        expect(activity.picks.map(pick => pick.option)).toEqual(['opt1']);
    });

    it('writes relations as ids — saving an activity links its steps, it does not save them', () => {
        const payload = activityMapper.toPayload({
            name: 'Treasure hunt',
            groups: [aGroup({ id: 'grp1' })],
            steps: [aStep({ id: 'stp1' })],
        });

        expect(payload).toEqual({ name: 'Treasure hunt', groups: ['grp1'], steps: ['stp1'] });
    });

    it('never writes the attribute rows: they are not fields of the activity', () => {
        const payload = activityMapper.toPayload({
            name: 'Treasure hunt',
            attributes: [anAttributeValue()],
            picks: [aPick()],
        });

        expect(payload).toEqual({ name: 'Treasure hunt' });
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
