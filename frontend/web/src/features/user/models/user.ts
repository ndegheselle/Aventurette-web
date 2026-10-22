import { UsersRoleOptions, type UsersResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

// No mapper: the session comes back from the auth port, which expands nothing and stores no
// file, so there is nothing to translate.
export type UserData = Entity<UsersResponse>;

export const Role = UsersRoleOptions;
export type Role = UsersRoleOptions;

/** The backend stores no role as an empty string: that is a plain user. */
export function roleOf(user: UserData): Role {
    return user.role || Role.USER;
}

/** No roles asked for means anyone, signed in or not; otherwise the user must hold one of them. */
export function hasRole(user: UserData | null, roles: readonly Role[] = []): boolean {
    if (roles.length === 0) return true;
    return user !== null && roles.includes(roleOf(user));
}

/** What the settings page edits of a user. */
export type ProfileForm = {
    name: string;
};

export function toProfileForm(user: Pick<UserData, 'name'> | null): ProfileForm {
    return { name: user?.name ?? '' };
}

/** What a save sends: a name of spaces only is no name. */
export function toProfilePatch(form: ProfileForm): Partial<UserData> {
    return { name: form.name.trim() };
}

/** The ids of the activities a user keeps as favorites. A copy: the session's own is read-only. */
export function favoritesOf(user: { favorites?: readonly string[] } | null): string[] {
    return [...(user?.favorites ?? [])];
}

/** Adding an activity already in the list leaves it as it was: the list holds each one once. */
export function withFavorite(favorites: string[], activityId: string): string[] {
    if (favorites.includes(activityId)) return favorites;
    return [...favorites, activityId];
}

export function withoutFavorite(favorites: string[], activityId: string): string[] {
    return favorites.filter(id => id !== activityId);
}
