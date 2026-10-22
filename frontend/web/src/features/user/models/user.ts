import { UsersRoleOptions, type UsersResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

// No mapper: the session comes back from the auth port, which expands nothing and stores no
// file, so there is nothing to translate.
export type UserData = Entity<UsersResponse>;

/**
 * What the session holds of the signed-in user: who they are and what they may do. The rest of
 * the record, their favorites included, is read by the screen that needs it.
 */
export type SessionUser = Pick<UserData, 'id' | 'email' | 'name' | 'avatar' | 'role'>;

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
