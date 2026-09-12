import { describe, expect, it } from 'vitest';
import { createPocketBaseFileUrls } from './files';
import { fakePocketBase } from './testing';

describe('createPocketBaseFileUrls', () => {
    it('resolves a stored file to a url, so components never hold the client', () => {
        const pb = fakePocketBase();
        const files = createPocketBaseFileUrls(pb.client);

        expect(files.getUrl({ id: 'res1' }, 'rules.pdf'))
            .toBe('https://pb.test/api/files/res1/rules.pdf');
    });

    it('asks for a thumbnail when one was requested', () => {
        const pb = fakePocketBase();

        createPocketBaseFileUrls(pb.client).getUrl({ id: 'res1' }, 'map.png', { thumb: '100x100' });

        expect(pb.lastCall('files.getURL')?.[2]).toEqual({ thumb: '100x100' });
    });

    it('sends no options at all when no thumbnail was asked for', () => {
        const pb = fakePocketBase();

        createPocketBaseFileUrls(pb.client).getUrl({ id: 'res1' }, 'map.png');

        expect(pb.lastCall('files.getURL')?.[2]).toBeUndefined();
    });
});
