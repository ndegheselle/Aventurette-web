import { resourceMapper, stepMapper } from '@features/activities/api/step.mapper';
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
