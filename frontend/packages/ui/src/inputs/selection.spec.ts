import { describe, expect, it } from 'vitest';
import { offered, optionsFor, optionsOf, toggled } from './selection';

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

describe('optionsFor', () => {
    const options = optionsOf(['spring', 'summer', 'winter'], value => value.toUpperCase());

    it('follows the options order, not the stored one', () => {
        expect(optionsFor(options, ['winter', 'spring']).map(option => option.value)).toEqual(['spring', 'winter']);
    });

    it('drops a value no option offers', () => {
        expect(optionsFor(options, ['summer', 'autumn']).map(option => option.value)).toEqual(['summer']);
    });
});

describe('offered', () => {
    it('stops offering what is picked', () => {
        expect(offered([art, forest], [forest], '', 'name')).toEqual([art]);
    });

    it('matches a copy to its option by keyBy', () => {
        // The field holds its own copy of the row, from another read.
        expect(offered([art, forest], [{ ...forest }], '', 'name', 'id')).toEqual([art]);
    });

    it('keeps what contains the search, whatever its case', () => {
        expect(offered([art, forest], [], 'RES', 'name')).toEqual([forest]);
    });
});
