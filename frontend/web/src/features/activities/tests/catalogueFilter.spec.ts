import { catalogueFilterOf } from '@features/activities/api/activity.mapper';
import { ActivityFormat, ActivityLocation } from '@features/activities/models/activity';
import { emptyCatalogueFilters, type CatalogueFilters } from '@features/activities/models/catalogueFilters';
import { FilterLogical, FilterOperator } from '@chapelure/core';
import { describe, expect, it } from 'vitest';

const filtersOf = (overrides: Partial<CatalogueFilters> = {}, search = '') =>
    catalogueFilterOf({ ...emptyCatalogueFilters(), ...overrides }, search).filters;

describe('catalogueFilterOf', () => {
    it('filters on nothing when nothing is chosen nor searched', () => {
        expect(filtersOf({}, '  ')).toEqual([]);
    });

    it('keeps an activity whose ages overlap the ones asked for, an unset upper age included', () => {
        expect(filtersOf({ ageMin: 3, ageMax: 6 })).toMatchObject([
            {
                filters: [
                    { key: 'age_max', operator: FilterOperator.GreaterOrEquals, value: 3, combine: FilterLogical.Or },
                    { key: 'age_max', operator: FilterOperator.Equals, value: 0 },
                ],
            },
            { key: 'age_min', operator: FilterOperator.LessOrEquals, value: 6 },
        ]);
    });

    it('bounds the duration the steps add up to', () => {
        expect(filtersOf({ durationMax: 30 })).toMatchObject([
            { key: 'duration', operator: FilterOperator.LessOrEquals, value: 30 },
        ]);
    });

    it('needs any one value of a list, a multiple one compared value by value, and every filter set', () => {
        expect(filtersOf({
            locations: [ActivityLocation.PARK, ActivityLocation.FOREST],
            formats: [ActivityFormat.WORKSHOP],
        })).toMatchObject([
            { key: 'locations:each', operator: FilterOperator.AnyEquals, value: ['PARK', 'FOREST'], combine: FilterLogical.And },
            { key: 'format', operator: FilterOperator.Equals, value: ['WORKSHOP'], combine: FilterLogical.And },
        ]);
    });

    it('searches the name and the description alongside the filters', () => {
        const [search, format] = filtersOf({ formats: [ActivityFormat.WORKSHOP] }, ' relais ');

        expect(search).toMatchObject({
            filters: [{ key: 'name', value: 'relais' }, { key: 'description', value: 'relais' }],
        });
        expect(format).toMatchObject({ key: 'format' });
    });
});
