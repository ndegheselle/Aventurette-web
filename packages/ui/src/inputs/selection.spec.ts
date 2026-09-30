import { describe, expect, it } from 'vitest';
import { toggled } from './selection';

const art = { id: 'a', name: 'Art' };
const forest = { id: 'b', name: 'Forest' };

describe('toggled', () => {
    it('adds what is not picked', () => {
        expect(toggled([art], forest)).toEqual([art, forest]);
    });

    it('removes what is picked', () => {
        expect(toggled([art, forest], art)).toEqual([forest]);
    });

    it('removes a copy by keyBy', () => {
        // The field holds its own copy of the row, from another read.
        expect(toggled([{ ...art }, forest], art, 'id')).toEqual([forest]);
    });

    it('adds a copy without keyBy, as another item', () => {
        expect(toggled([{ ...art }], art)).toHaveLength(2);
    });
});
