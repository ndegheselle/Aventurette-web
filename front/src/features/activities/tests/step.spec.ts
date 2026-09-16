import {
    canCreateMaterial,
    filesWithinLimit,
    materialNameSuggestions,
    resourceMapper,
    stepMapper,
} from '@features/activities/model/step';
import {
    aMaterial,
    aMaterialPayload,
    aPickedFile,
    aResource,
    aResourcePayload,
    aStepPayload,
    fakeFileUrls,
} from '@tests';
import { describe, expect, it } from 'vitest';

const files = fakeFileUrls();

describe('stepMapper', () => {
    it('reads its relations out of `expand`, and leaves no trace of it behind', () => {
        const rope = aMaterialPayload({ id: 'mat1', name: 'Rope' });

        const step = stepMapper.toEntity(
            aStepPayload({ materials: ['mat1'], expand: { materials: [rope] } }),
            files,
        );

        expect(step.materials.map(material => material.name)).toEqual(['Rope']);
        expect(step).not.toHaveProperty('expand');
    });

    it('reads an unexpanded relation as empty, rather than as the ids it holds', () => {
        // PocketBase omits a relation that matched nothing instead of sending back an empty
        // array, so the two cases arrive the same way and mean the same thing here.
        const step = stepMapper.toEntity(aStepPayload({ materials: ['mat1'] }), files);

        expect(step.materials).toEqual([]);
        expect(step.resources).toEqual([]);
    });

    it('writes relations back as ids — saving a step links its materials, it does not save them', () => {
        const payload = stepMapper.toPayload({
            description: '<p>Hide.</p>',
            materials: [aMaterial({ id: 'mat1' })],
            resources: [aResource({ id: 'res1' })],
        });

        expect(payload).toEqual({
            description: '<p>Hide.</p>',
            materials: ['mat1'],
            resources: ['res1'],
        });
    });

    it('leaves out a relation the caller did not mention, so an update stays partial', () => {
        expect(stepMapper.toPayload({ description: '<p>Hide.</p>' }))
            .toEqual({ description: '<p>Hide.</p>' });
    });
});

describe('resourceMapper', () => {
    it('turns the stored file name into the url a template can read', () => {
        const resource = resourceMapper.toEntity(
            aResourcePayload({ id: 'res1', file: 'rules.pdf' }),
            files,
        );

        expect(resource.url).toBe('https://files.test/res1/rules.pdf');
        expect(resource).not.toHaveProperty('file');
    });

    it('has no url for a record carrying no file', () => {
        expect(resourceMapper.toEntity(aResourcePayload({ file: undefined }), files).url).toBe('');
    });

    it('sends the picked file on the way up, and never the url', () => {
        const file = aPickedFile('map.png');

        expect(resourceMapper.toPayload({ name: 'map.png', step: 'stp1', file, url: 'https://files.test/x' }))
            .toEqual({ name: 'map.png', step: 'stp1', file });
    });
});

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
