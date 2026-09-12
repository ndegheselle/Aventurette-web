import {
    canCreateMaterial,
    filesWithinLimit,
    materialNameSuggestions,
} from '@features/activities/model/step';
import { aMaterial, aPickedFile } from '@tests';
import { describe, expect, it } from 'vitest';

describe('materialNameSuggestions', () => {
    it('offers the names already used elsewhere', () => {
        const known = [aMaterial({ name: 'Rope' }), aMaterial({ name: 'Chalk' })];

        expect(materialNameSuggestions(known, [])).toEqual(['Rope', 'Chalk']);
    });

    it('leaves out what this step already has, whatever the spelling', () => {
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

    it('does not, when the step already has it', () => {
        expect(canCreateMaterial('rope', [], [aMaterial({ name: 'Rope' })])).toBe(false);
    });

    it('does not, for whitespace', () => {
        expect(canCreateMaterial('   ', [], [])).toBe(false);
    });
});

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
