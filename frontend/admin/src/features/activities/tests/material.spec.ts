import { activityMaterialMapper } from '@features/activities/api/material.mapper';
import { aMaterial, aMaterialPayload, fakeFileUrls } from '@tests';
import { describe, expect, it } from 'vitest';

const files = fakeFileUrls();

describe('activityMaterialMapper', () => {
    it('folds the catalogue material\'s name into the link, and leaves no trace of `expand`', () => {
        const link = activityMaterialMapper.toEntity(
            aMaterialPayload({ name: 'Rope', material: 'mat1', quantity: 'one per team' }),
            files,
        );

        expect(link).toMatchObject({ name: 'Rope', material: 'mat1', quantity: 'one per team' });
        expect(link).not.toHaveProperty('expand');
    });

    it('reads an unexpanded material as no name, rather than failing', () => {
        const link = activityMaterialMapper.toEntity(aMaterialPayload({ expand: {} }), files);

        expect(link.name).toBe('');
    });

    it('never writes the name back — renaming is the catalogue\'s, not the link\'s', () => {
        const payload = activityMaterialMapper.toPayload(
            aMaterial({ id: 'amt1', activity: 'act1', material: 'mat1', name: 'Rope', quantity: '2' }),
        );

        expect(payload).not.toHaveProperty('name');
        expect(payload).toMatchObject({ activity: 'act1', material: 'mat1', quantity: '2' });
    });
});
