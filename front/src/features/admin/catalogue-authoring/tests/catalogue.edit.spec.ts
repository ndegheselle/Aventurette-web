import { FilterOperator, isFilterGroup } from '@chapelure/core';
import { ActivityTagType } from '@features/activities/model/tag';
import { renamedTo, slugFollowing, slugify, tagsFilter } from '@features/admin/catalogue-authoring/model/catalogue.edit';
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

describe('slugify', () => {
    it('lowers the case and drops the accents', () => {
        expect(slugify('Forêt Enchantée')).toBe('foret-enchantee');
    });

    it('spells out the ligatures', () => {
        expect(slugify('Cœur')).toBe('coeur');
    });

    it('turns every run of anything else into one dash, none at the ends', () => {
        expect(slugify(' Eau (baignade) / piscine! ')).toBe('eau-baignade-piscine');
    });
});

describe('slugFollowing', () => {
    it('follows the name while the slug is empty', () => {
        expect(slugFollowing('', '', 'Feu')).toBe('feu');
    });

    it('follows the name while the slug is still the one the previous name gave', () => {
        expect(slugFollowing('feu', 'Feu', 'Feu de camp')).toBe('feu-de-camp');
    });

    it('keeps a slug the author wrote', () => {
        expect(slugFollowing('camp-fire', 'Feu', 'Feu de camp')).toBe('camp-fire');
    });
});

describe('tagsFilter', () => {
    it('asks for everything with no search and every kind', () => {
        expect(tagsFilter('', null).filters).toEqual([]);
    });

    it('narrows to one kind without an empty search group, which the backend refuses', () => {
        const { filters } = tagsFilter('  ', ActivityTagType.THEME);

        expect(filters).toHaveLength(1);
        expect(filters[0]).toMatchObject({ key: 'type', value: ActivityTagType.THEME, operator: FilterOperator.Equals });
    });

    it('searches the name and the slug, within the kind', () => {
        const [search, type] = tagsFilter('pirate', ActivityTagType.IMAGINARY).filters;

        expect(isFilterGroup(search!) && search.filters.map(f => !isFilterGroup(f) && f.key)).toEqual(['name', 'slug']);
        expect(type).toMatchObject({ key: 'type', value: ActivityTagType.IMAGINARY });
    });
});
