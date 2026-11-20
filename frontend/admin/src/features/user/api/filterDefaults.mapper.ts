import type { UsersResponse } from '@/backend/schema.g';
import type { EntityMapper } from '@chapelure/core';
import type { DefaultBound, FilterDefaultsData } from '@features/user/models/user';

/** PocketBase stores an empty number as 0, and no bound means anything by a 0: 0 is unset. */
const boundOf = (value: number | undefined): DefaultBound => value ? value : null;

/** Reads a user record for its filter defaults, and nothing else of it. */
export const filterDefaultsMapper: EntityMapper<UsersResponse, FilterDefaultsData> = {
    relations: [],
    toEntity: (user) => ({
        id: user.id,
        ageMin: boundOf(user.defaultAgeMin),
        ageMax: boundOf(user.defaultAgeMax),
        participantsMin: boundOf(user.defaultParticipantsMin),
        participantsMax: boundOf(user.defaultParticipantsMax),
        locations: user.defaultLocations ?? [],
        onboarded: user.onboarded ?? false,
    }),
    // Only what is given is sent, so putting the onboarding off leaves the defaults as they were.
    // And back: an unset bound is stored as the 0 PocketBase would store anyway.
    toPayload: (defaults) => ({
        ...(defaults.ageMin !== undefined && { defaultAgeMin: defaults.ageMin ?? 0 }),
        ...(defaults.ageMax !== undefined && { defaultAgeMax: defaults.ageMax ?? 0 }),
        ...(defaults.participantsMin !== undefined && { defaultParticipantsMin: defaults.participantsMin ?? 0 }),
        ...(defaults.participantsMax !== undefined && { defaultParticipantsMax: defaults.participantsMax ?? 0 }),
        ...(defaults.locations && { defaultLocations: defaults.locations }),
        ...(defaults.onboarded !== undefined && { onboarded: defaults.onboarded }),
    }),
};
