import { createFilter, createGroup, FilterLogical, FilterOperator } from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { filterGroupToPocketBase, filterToPocketBase } from './filters';

type Activity = { name: string; ageMin: number; benefits: string[]; environment: string };

describe('filterToPocketBase', () => {
    it.each([
        [FilterOperator.Equals, "name='hunt'"],
        [FilterOperator.Contains, "name~'hunt'"],
        [FilterOperator.GreaterThan, "name>'hunt'"],
        [FilterOperator.LessThan, "name<'hunt'"],
        [FilterOperator.AnyEquals, "name?='hunt'"],
    ])('renders %s', (operator, expected) => {
        expect(filterToPocketBase(createFilter<Activity>({ key: 'name', value: 'hunt', operator })))
            .toBe(expected);
    });

    it('leaves numbers and booleans unquoted, so they compare as numbers', () => {
        expect(filterToPocketBase(createFilter<Activity>({ key: 'ageMin', value: 6 }))).toBe('ageMin~6');
        expect(filterToPocketBase(createFilter<any>({ key: 'verified', value: true }))).toBe('verified~true');
    });

    it('renders null as the literal null, not as the string "null"', () => {
        expect(filterToPocketBase(createFilter<any>({ key: 'ageMin', value: null }))).toBe('ageMin~null');
    });

    it('escapes quotes in a value, so a search term cannot break out of the literal', () => {
        expect(filterToPocketBase(createFilter<Activity>({ key: 'name', value: "l'ete" })))
            .toBe("name~'l\\'ete'");
    });

    it('turns an array into an OR over its values', () => {
        expect(filterToPocketBase(createFilter<Activity>({
            key: 'environment',
            value: ['INDOOR', 'OUTDOOR'],
            operator: FilterOperator.Equals,
        }))).toBe("(environment='INDOOR' || environment='OUTDOOR')");
    });

    it('is empty for an empty array, so it contributes nothing', () => {
        expect(filterToPocketBase(createFilter<Activity>({ key: 'environment', value: [] }))).toBe('');
    });
});

describe('filterGroupToPocketBase', () => {
    it('is empty for a group with no filters', () => {
        expect(filterGroupToPocketBase(createGroup<Activity>({}))).toBe('');
    });

    it('joins with the operator carried by the filter on the left', () => {
        const group = createGroup<Activity>({
            filters: [
                createFilter<Activity>({ key: 'name', value: 'hunt', combine: FilterLogical.Or }),
                createFilter<Activity>({ key: 'ageMin', value: 6 }),
            ],
        });

        expect(filterGroupToPocketBase(group)).toBe("name~'hunt' || ageMin~6");
    });

    it('parenthesises a nested group, so its ORs cannot leak into the outer ANDs', () => {
        const group = createGroup<Activity>({
            filters: [
                createGroup<Activity>({
                    filters: [
                        createFilter<Activity>({ key: 'name', value: 'a', combine: FilterLogical.Or }),
                        createFilter<Activity>({ key: 'name', value: 'b' }),
                    ],
                }),
                createFilter<Activity>({ key: 'ageMin', value: 6, operator: FilterOperator.GreaterThan }),
            ],
        });

        expect(filterGroupToPocketBase(group)).toBe("(name~'a' || name~'b') && ageMin>6");
    });

    it('builds the query the activities screen sends when every filter is set', () => {
        const group = createGroup<Activity>({
            filters: [
                createFilter<Activity>({ key: 'ageMin', value: 6, operator: FilterOperator.GreaterThan }),
                createFilter<Activity>({ key: 'benefits', value: ['bnf1', 'bnf2'], operator: FilterOperator.AnyEquals }),
                createGroup<Activity>({
                    filters: [createFilter<Activity>({ key: 'name', value: 'hunt', combine: FilterLogical.Or })],
                }),
            ],
        });

        expect(filterGroupToPocketBase(group))
            .toBe("ageMin>6 && (benefits?='bnf1' || benefits?='bnf2') && (name~'hunt')");
    });
});
