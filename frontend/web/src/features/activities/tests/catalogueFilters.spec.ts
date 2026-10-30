import { ActivityFormat, ActivityLocation, ActivitySeason } from '@features/activities/models/activity';
import {
    activeFilterCount,
    emptyCatalogueFilters,
    matchesProfile,
    quickFilterLabel,
    withChoiceToggled,
    withoutProfile,
    withProfile,
    type CatalogueFilters,
} from '@features/activities/models/catalogueFilters';
import type { FilterDefaultsData } from '@features/user/models/user';
import { describe, expect, it } from 'vitest';

const filters = (overrides: Partial<CatalogueFilters> = {}): CatalogueFilters =>
    ({ ...emptyCatalogueFilters(), ...overrides });

const profile = (overrides: Partial<FilterDefaultsData> = {}): FilterDefaultsData => ({
    id: 'user', ageMin: 3, ageMax: 6, durationMin: null, durationMax: 30,
    locations: [ActivityLocation.PARK, ActivityLocation.FOREST], onboarded: true,
    ...overrides,
});

describe('quickFilterLabel', () => {
    it('reads as the filter\'s name while nothing is chosen', () => {
        expect(quickFilterLabel(filters(), 'age')).toEqual({ key: 'activities.filters.quick.age', params: {} });
    });

    it('reads as the range chosen, open on the side left unset', () => {
        expect(quickFilterLabel(filters({ ageMin: 3, ageMax: 6 }), 'age'))
            .toEqual({ key: 'activities.filters.age.between', params: { min: 3, max: 6 } });
        expect(quickFilterLabel(filters({ durationMax: 30 }), 'duration'))
            .toEqual({ key: 'activities.filters.duration.upTo', params: { max: 30 } });
    });

    it('names a single place, and counts several', () => {
        expect(quickFilterLabel(filters({ locations: [ActivityLocation.PARK] }), 'location'))
            .toEqual({ key: 'activities.location.PARK', params: {} });
        expect(quickFilterLabel(filters({ locations: [ActivityLocation.PARK, ActivityLocation.LAKE] }), 'location'))
            .toEqual({ key: 'activities.filters.locations', params: { count: 2 } });
    });
});

describe('activeFilterCount', () => {
    it('counts a range or a list once, however much of it is chosen', () => {
        const set = filters({
            ageMin: 3, ageMax: 6,
            seasons: [ActivitySeason.SPRING, ActivitySeason.SUMMER],
        });

        expect(activeFilterCount(set)).toBe(2);
    });
});

describe('withChoiceToggled', () => {
    it('adds a value not chosen, and takes a chosen one off', () => {
        const once = withChoiceToggled(filters(), 'formats', ActivityFormat.WORKSHOP);
        expect(once.formats).toEqual([ActivityFormat.WORKSHOP]);
        expect(withChoiceToggled(once, 'formats', ActivityFormat.WORKSHOP).formats).toEqual([]);
    });
});

describe('the profile', () => {
    it('sets the quick filters only, leaving the others as they were', () => {
        const applied = withProfile(filters({ seasons: [ActivitySeason.WINTER] }), profile());

        expect(applied).toMatchObject({ ageMin: 3, ageMax: 6, durationMax: 30, seasons: [ActivitySeason.WINTER] });
        expect(withoutProfile(applied)).toEqual(filters({ seasons: [ActivitySeason.WINTER] }));
    });

    it('reads as applied whatever order the places were picked in', () => {
        const picked = withProfile(filters(), profile());
        picked.locations.reverse();

        expect(matchesProfile(picked, profile())).toBe(true);
    });

    it('reads as off once a quick filter moves away from it', () => {
        expect(matchesProfile({ ...withProfile(filters(), profile()), ageMax: 8 }, profile())).toBe(false);
    });

    it('is never applied when it chose nothing, even on empty filters', () => {
        const empty = profile({ ageMin: null, ageMax: null, durationMax: null, locations: [] });

        expect(matchesProfile(filters(), empty)).toBe(false);
    });
});
