import { aPickedFile, withSetup } from '@tests';
import { describe, expect, it } from 'vitest';
import { matchesAccept, useOneFile } from './useFiles';

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

describe('matchesAccept', () => {
    it('matches an extension whatever its case', () => {
        expect(matchesAccept(aPickedFile('MAP.PNG', 'image/png'), '.pdf, .png')).toBe(true);
    });

    it('matches a wildcard type on its family only', () => {
        expect(matchesAccept(aPickedFile('photo.webp', 'image/webp'), 'image/*')).toBe(true);
        expect(matchesAccept(aPickedFile('rules.pdf', 'application/pdf'), 'image/*')).toBe(false);
    });

    it('matches an exact type exactly', () => {
        expect(matchesAccept(aPickedFile('rules.pdf', 'application/pdf'), 'application/pdf')).toBe(true);
        expect(matchesAccept(aPickedFile('notes.txt', 'text/plain'), 'application/pdf')).toBe(false);
    });
});
