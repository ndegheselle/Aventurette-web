import { renamedTo } from '@features/admin/materials-authoring/model/material.edit';
import { describe, expect, it } from 'vitest';

describe('renamedTo', () => {
    it('writes what was typed, trimmed', () => {
        expect(renamedTo('Rope', '  Long rope ')).toBe('Long rope');
    });

    it('writes nothing for a field left as it was, spaces aside', () => {
        expect(renamedTo('Rope', ' Rope ')).toBeNull();
    });

    it('writes nothing for a blank field — the catalogue refuses a material with no name', () => {
        expect(renamedTo('Rope', '   ')).toBeNull();
    });

    it('writes a change of case: the catalogue tells the two apart only to refuse a duplicate', () => {
        expect(renamedTo('rope', 'Rope')).toBe('Rope');
    });
});
