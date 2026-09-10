import { aPickedFile, withSetup } from '@tests';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAlert } from '@chapelure/ui/composables/useAlert';
import { useMultipleFiles, useOneFile } from './useFiles';

const alert = useAlert();

beforeEach(() => {
    alert.alerts.value = [];
});

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

describe('useMultipleFiles', () => {
    it('accumulates across separate picks', () => {
        const [many] = withSetup(() => useMultipleFiles(5));

        many.update([aPickedFile('a.png')]);
        many.update([aPickedFile('b.png')]);

        expect(many.files.value.map(f => f.name)).toEqual(['a.png', 'b.png']);
    });

    it('takes what fits and says why the rest was dropped', () => {
        const [many] = withSetup(() => useMultipleFiles(2));

        many.update([aPickedFile('a.png'), aPickedFile('b.png'), aPickedFile('c.png')]);

        expect(many.files.value.map(f => f.name)).toEqual(['a.png', 'b.png']);
        expect(alert.alerts.value[0]?.message).toBe('2 files maximum.');
    });

    it('adds nothing once the limit is already reached', () => {
        const [many] = withSetup(() => useMultipleFiles(1));
        many.update([aPickedFile('a.png')]);

        many.update([aPickedFile('b.png')]);

        expect(many.files.value.map(f => f.name)).toEqual(['a.png']);
    });

    it('stays silent while there is room', () => {
        const [many] = withSetup(() => useMultipleFiles(10));

        many.update([aPickedFile('a.png')]);

        expect(alert.alerts.value).toEqual([]);
    });
});
