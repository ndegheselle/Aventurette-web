import { aMaterial, aPickedFile, aResource, aStep, anActivity } from '@tests';
import { describe, expect, it } from 'vitest';
import { createEmptyStep, isUploadedResource, materialsOf, resourcesOf } from './activity';

describe('isUploadedResource', () => {
    it('recognises a saved resource by its stored filename', () => {
        expect(isUploadedResource(aResource({ file: 'rules.pdf' }))).toBe(true);
    });

    it('recognises one still waiting to be uploaded by its File', () => {
        expect(isUploadedResource({ file: aPickedFile('map.png'), name: 'map.png' })).toBe(false);
    });
});

describe('createEmptyStep', () => {
    it('starts with room for materials and resources, so the editor can push into them', () => {
        const step = createEmptyStep();

        expect(step.materials).toEqual([]);
        expect(step.resources).toEqual([]);
    });

    it('gives each call its own arrays', () => {
        expect(createEmptyStep().materials).not.toBe(createEmptyStep().materials);
    });
});

describe('materialsOf', () => {
    it('gathers what the steps need, since materials hang off steps not activities', () => {
        const rope = aMaterial({ name: 'Rope' });
        const chalk = aMaterial({ name: 'Chalk' });
        const activity = anActivity({
            steps: [aStep({ materials: [rope] }), aStep({ materials: [chalk] })],
        });

        expect(materialsOf(activity).map(m => m.name)).toEqual(['Rope', 'Chalk']);
    });

    it('lists a material shared by two steps once', () => {
        const rope = aMaterial({ name: 'Rope' });
        const activity = anActivity({
            steps: [aStep({ materials: [rope] }), aStep({ materials: [{ ...rope }] })],
        });

        expect(materialsOf(activity)).toHaveLength(1);
    });

    it('is empty for an activity with no steps, and for no activity at all', () => {
        expect(materialsOf(anActivity({ steps: [] }))).toEqual([]);
        expect(materialsOf(null)).toEqual([]);
        expect(materialsOf(undefined)).toEqual([]);
    });
});

describe('resourcesOf', () => {
    it('gathers the resources attached to the steps', () => {
        const sheet = aResource({ name: 'Rules sheet' });
        const map = aResource({ name: 'Map' });
        const activity = anActivity({
            steps: [aStep({ resources: [sheet] }), aStep({ resources: [map] })],
        });

        expect(resourcesOf(activity).map(r => r.name)).toEqual(['Rules sheet', 'Map']);
    });

    it('leaves out files not uploaded yet, which have no url to show', () => {
        const activity = anActivity({
            steps: [aStep({
                resources: [aResource(), { file: aPickedFile('pending.png'), name: 'pending.png' }],
            })],
        });

        expect(resourcesOf(activity)).toHaveLength(1);
    });

    it('is empty when there is nothing to show', () => {
        expect(resourcesOf(anActivity({ steps: [aStep()] }))).toEqual([]);
        expect(resourcesOf(null)).toEqual([]);
    });
});
