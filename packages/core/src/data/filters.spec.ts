import { describe, expect, it } from 'vitest';
import {
    createFilter,
    createGroup,
    createSearchFilter,
    FilterLogical,
    FilterOperator,
    isFilterGroup,
    removeEmptyFilters,
} from './filters';

type Activity = { name: string; description: string; ageMin: number; benefits: string[] };

describe('createFilter', () => {
    it('defaults to a Contains filter combined with AND', () => {
        expect(createFilter<Activity>({ key: 'name', value: 'hunt' })).toEqual({
            key: 'name',
            value: 'hunt',
            operator: FilterOperator.Contains,
            combine: FilterLogical.And,
        });
    });

    it('keeps what the caller specified', () => {
        const filter = createFilter<Activity>({
            key: 'ageMin',
            value: 6,
            operator: FilterOperator.GreaterThan,
            combine: FilterLogical.Or,
        });

        expect(filter.operator).toBe(FilterOperator.GreaterThan);
        expect(filter.combine).toBe(FilterLogical.Or);
    });
});

describe('createSearchFilter', () => {
    it('is null for an empty search, so callers can skip adding it', () => {
        expect(createSearchFilter<Activity>('', ['name'])).toBeNull();
    });

    it('searches every key, any of which may match', () => {
        const group = createSearchFilter<Activity>('hunt', ['name', 'description']);

        expect(group?.filters).toHaveLength(2);
        expect(group?.filters.every(f => !isFilterGroup(f) && f.combine === FilterLogical.Or)).toBe(true);
        expect(group?.filters.map(f => (f as any).key)).toEqual(['name', 'description']);
    });
});

describe('removeEmptyFilters', () => {
    it('drops filters with no value, so an untouched form field adds no criterion', () => {
        const group = createGroup<Activity>({
            filters: [
                createFilter<Activity>({ key: 'name', value: 'hunt' }),
                createFilter<Activity>({ key: 'ageMin', value: null }),
                createFilter<Activity>({ key: 'description', value: '' }),
            ],
        });

        expect(removeEmptyFilters(group).filters).toHaveLength(1);
    });

    it('drops an empty array but keeps a populated one', () => {
        const group = createGroup<Activity>({
            filters: [
                createFilter<Activity>({ key: 'benefits', value: [] }),
                createFilter<Activity>({ key: 'benefits', value: ['bnf1'] }),
            ],
        });

        expect(removeEmptyFilters(group).filters).toHaveLength(1);
    });

    it('cleans nested groups too', () => {
        const group = createGroup<Activity>({
            filters: [
                createGroup<Activity>({
                    filters: [
                        createFilter<Activity>({ key: 'name', value: 'hunt' }),
                        createFilter<Activity>({ key: 'description', value: null }),
                    ],
                }),
            ],
        });

        const nested = removeEmptyFilters(group).filters[0];
        expect(isFilterGroup(nested!) && nested.filters).toHaveLength(1);
    });

    it('drops falsy scalars, so `0` cannot be filtered on', () => {
        const group = createGroup<Activity>({
            filters: [createFilter<Activity>({ key: 'ageMin', value: 0 })],
        });

        // Falsy scalars are dropped, so a zero-minimum-age filter looks like an untouched field.
        // The age form treats null, not 0, as "not set".
        expect(removeEmptyFilters(group).filters).toHaveLength(0);
    });
});
