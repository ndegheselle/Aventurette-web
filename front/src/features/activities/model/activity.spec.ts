import { aMaterial, aResource, aStep, anActivity } from '@tests';
import { describe, expect, it } from 'vitest';
import { createEmptyActivity, createEmptyStep, EMPTY_DESCRIPTION, materialsOf, resourcesOf } from './activity';

describe('createEmptyActivity', () => {
    it('fills in what the collection requires, so an activity can be created before it is written', () => {
        const activity = createEmptyActivity();

        expect(activity.description).toBe(EMPTY_DESCRIPTION);
        expect(activity.environment).toBeDefined();
    });
});

describe('createEmptyStep', () => {
    it('starts with room for materials and resources, so the editor can push into them', () => {
        const step = createEmptyStep('act-1');

        expect(step.materials).toEqual([]);
        expect(step.resources).toEqual([]);
    });

    it('belongs to the activity it was created for, which the collection requires', () => {
        expect(createEmptyStep('act-1').activity).toBe('act-1');
    });

    it('gives each call its own arrays', () => {
        expect(createEmptyStep('act-1').materials).not.toBe(createEmptyStep('act-1').materials);
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

    it('lists a resource shared by two steps once', () => {
        const sheet = aResource({ name: 'Rules sheet' });
        const activity = anActivity({
            steps: [aStep({ resources: [sheet] }), aStep({ resources: [{ ...sheet }] })],
        });

        expect(resourcesOf(activity)).toHaveLength(1);
    });

    it('is empty when there is nothing to show', () => {
        expect(resourcesOf(anActivity({ steps: [aStep()] }))).toEqual([]);
        expect(resourcesOf(null)).toEqual([]);
    });
});
