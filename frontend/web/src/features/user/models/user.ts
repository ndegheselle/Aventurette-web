import { UsersDefaultLocationsOptions, UsersRoleOptions, type UsersResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

// No mapper: the session comes back from the auth port, which expands nothing and stores no
// file, so there is nothing to translate.
export type UserData = Entity<UsersResponse>;

/**
 * What the session holds of the signed-in user: who they are, what they may do and whether they
 * have been onboarded. The rest of the record, their favorites and filter defaults included, is
 * read by the screen that needs it.
 */
export type SessionUser = Pick<UserData, 'id' | 'email' | 'name' | 'avatar' | 'role' | 'onboarded'>;

export const Role = UsersRoleOptions;
export type Role = UsersRoleOptions;

/** The backend stores no role as an empty string: that is a plain user. */
export function roleOf(user: Pick<UserData, 'role'>): Role {
    return user.role || Role.USER;
}

/** No roles asked for means anyone, signed in or not; otherwise the user must hold one of them. */
export function hasRole(user: Pick<UserData, 'role'> | null, roles: readonly Role[] = []): boolean {
    if (roles.length === 0) return true;
    return user !== null && roles.includes(roleOf(user));
}

// ── Filter defaults ─────────────────────────────────────────────────────────────────────────

export const Location = UsersDefaultLocationsOptions;
export type Location = UsersDefaultLocationsOptions;

/** A bound of a default as a range reads it: `null` is unset, no limit on that side. */
export type DefaultBound = number | null;

/**
 * What the catalogue's filters start from: the ages, the duration in minutes and the places the
 * user looks for activities in. Chosen at onboarding, changed in the profile.
 */
export interface FilterDefaultsData {
    id: string;
    ageMin: DefaultBound;
    ageMax: DefaultBound;
    durationMin: DefaultBound;
    durationMax: DefaultBound;
    locations: Location[];
    /** Whether the onboarding was shown, saved or put off. */
    onboarded: boolean;
}

/** How far the sliders go: ages in years, durations in minutes. */
export const DEFAULT_AGE_BOUNDS = { floor: 0, ceiling: 18 };
export const DEFAULT_DURATION_BOUNDS = { floor: 0, ceiling: 120, step: 5 };

/** A signed-in user who has not seen the onboarding is sent there before anything else. */
export function needsOnboarding(user: Pick<SessionUser, 'onboarded'> | null): boolean {
    return user !== null && !user.onboarded;
}
