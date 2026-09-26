import { aPickedFile, withSetup } from '@tests';
import { describe, expect, it } from 'vitest';
import { useOneFile } from './useFiles';

describe('useOneFile', () => {
    it('starts empty', () => {
        const [files] = withSetup(() => useOneFile());
        expect(files.files.value).toEqual([]);
    });

    it('keeps only the first file, however many were dropped', () => {
        const [one] = withSetup(() => useOneFile());

        one.update([aPickedFile('a.png'), aPickedFile('b.png')]);

        expect(one.files.value.map(f => f.name)).toEqual(['a.png']);
    });

    it('replaces the previous file rather than appending', () => {
        const [one] = withSetup(() => useOneFile());

        one.update([aPickedFile('first.png')]);
        one.update([aPickedFile('second.png')]);

        expect(one.files.value.map(f => f.name)).toEqual(['second.png']);
    });
});
