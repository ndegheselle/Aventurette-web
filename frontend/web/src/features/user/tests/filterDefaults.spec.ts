import { aUser, fakeFileUrls } from '@tests';
import { describe, expect, it } from 'vitest';
import type { UsersResponse } from '@/backend/schema.g';
import { filterDefaultsMapper } from '@features/user/api/filterDefaults.mapper';
import { Location } from '@features/user/models/user';

const payload = (overrides: Partial<UsersResponse> = {}) => aUser(overrides) as unknown as UsersResponse;

describe('filterDefaultsMapper', () => {
    it('reads a 0 bound as unset, as PocketBase stores an empty number', () => {
        const defaults = filterDefaultsMapper.toEntity(payload({ defaultAgeMin: 0, defaultAgeMax: 8 }), fakeFileUrls());

        expect(defaults).toMatchObject({ ageMin: null, ageMax: 8 });
    });

    it('reads a user who never chose anything as no default at all, not yet onboarded', () => {
        const defaults = filterDefaultsMapper.toEntity(payload({ onboarded: undefined }), fakeFileUrls());

        expect(defaults).toMatchObject({
            ageMin: null, ageMax: null, durationMin: null, durationMax: null, locations: [], onboarded: false,
        });
    });

    it('writes an unset bound back as 0', () => {
        expect(filterDefaultsMapper.toPayload({ ageMin: null, durationMax: 45, locations: [Location.PARK] }))
            .toEqual({ defaultAgeMin: 0, defaultDurationMax: 45, defaultLocations: [Location.PARK] });
    });

    it('sends only what is given, so putting the onboarding off keeps the defaults', () => {
        expect(filterDefaultsMapper.toPayload({ onboarded: true })).toEqual({ onboarded: true });
    });
});
