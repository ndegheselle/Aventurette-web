import { aMaterial } from '@tests';
import { describe, expect, it } from 'vitest';
import { canCreateMaterial, materialNameSuggestions } from './material';

describe('materialNameSuggestions', () => {
    it('offers the names used elsewhere, since a material belongs to one step', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'Chalk' })];

        expect(materialNameSuggestions(known, [])).toEqual(['Rope', 'Chalk']);
    });

    it('lists a name used by several steps once, keeping the first spelling', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'rope' })];

        expect(materialNameSuggestions(known, [])).toEqual(['Rope']);
    });

    it('leaves out what the step already has', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'Chalk' })];

        expect(materialNameSuggestions(known, [aMaterial({ name: 'rope' })])).toEqual(['Chalk']);
    });

    it('narrows to what was typed, wherever it matches', () => {
        const known = [aMaterial({ name: 'Skipping rope' }), aMaterial({ name: 'Chalk' })];

        expect(materialNameSuggestions(known, [], 'ROPE')).toEqual(['Skipping rope']);
    });

    it('ignores rows with no name to offer', () => {
        expect(materialNameSuggestions([aMaterial({ name: '  ' })], [])).toEqual([]);
    });
});

describe('canCreateMaterial', () => {
    it('offers to create a name nobody has used', () => {
        expect(canCreateMaterial('Hoop', ['Rope'], [])).toBe(true);
    });

    it('says nothing for an empty input', () => {
        expect(canCreateMaterial('   ', [], [])).toBe(false);
    });

    it('does not offer what is already suggested — picking it writes the same row', () => {
        expect(canCreateMaterial('rope', ['Rope'], [])).toBe(false);
    });

    it('does not offer what the step already has', () => {
        expect(canCreateMaterial('Rope', [], [aMaterial({ name: 'rope' })])).toBe(false);
    });
});
