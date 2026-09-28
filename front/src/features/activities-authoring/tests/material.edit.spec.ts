import {
    canCreateMaterial,
    materialNameSuggestions,
    withoutMaterial,
} from '@features/activities-authoring/model/material.edit';
import { aMaterial, aStep, aWorkshop, anActivity } from '@tests';
import { describe, expect, it } from 'vitest';

describe('materialNameSuggestions', () => {
    it('offers the names already used elsewhere', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'Chalk' })];

        expect(materialNameSuggestions(known, [])).toEqual(['Rope', 'Chalk']);
    });

    it('leaves out what this activity already has, whatever the spelling', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'Chalk' })];

        expect(materialNameSuggestions(known, [aMaterial({ name: ' rope ' })])).toEqual(['Chalk']);
    });

    it('offers one spelling of a name used twice — the first seen', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'ROPE' })];

        expect(materialNameSuggestions(known, [])).toEqual(['Rope']);
    });

    it('narrows to what the user typed, case-insensitively', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'Chalk' })];

        expect(materialNameSuggestions(known, [], 'RO')).toEqual(['Rope']);
    });

    it('skips a material with no name to offer', () => {
        expect(materialNameSuggestions([aMaterial({ name: '  ' })], [])).toEqual([]);
    });
});

describe('canCreateMaterial', () => {
    it('offers to create a name nobody has used', () => {
        expect(canCreateMaterial('Rope', [], [])).toBe(true);
    });

    it('does not, when picking a suggestion would write the same row', () => {
        expect(canCreateMaterial('rope', ['Rope'], [])).toBe(false);
    });

    it('does not, when the activity already has it', () => {
        expect(canCreateMaterial('rope', [], [aMaterial({ name: 'Rope' })])).toBe(false);
    });

    it('does not, for whitespace', () => {
        expect(canCreateMaterial('   ', [], [])).toBe(false);
    });
});

describe('withoutMaterial', () => {
    it('takes a deleted material off the activity and off every step and workshop recalling it', () => {
        // The backend drops the links itself; a step still holding the id would send it back on
        // its next save and be refused.
        const rope = aMaterial({ id: 'mat1' });
        const chalk = aMaterial({ id: 'mat2' });
        const activity = anActivity({
            materials: [rope, chalk],
            steps: [aStep({ materials: [{ ...rope }, { ...chalk }] })],
            workshops: [aWorkshop({ materials: [{ ...rope }] })],
        });

        const after = withoutMaterial(activity, 'mat1');

        expect(after.materials).toEqual([chalk]);
        expect(after.steps[0]!.materials.map(material => material.id)).toEqual(['mat2']);
        expect(after.workshops[0]!.materials).toEqual([]);
    });
});
