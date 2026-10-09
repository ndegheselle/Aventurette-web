import type { UserData } from '@features/auth/model/user';

/** What the settings page edits of a user. */
export type ProfileForm = {
    name: string;
};

export function toProfileForm(user: UserData | null): ProfileForm {
    return { name: user?.name ?? '' };
}

/** What a save sends: a name of spaces only is no name. */
export function toProfilePatch(form: ProfileForm): Partial<UserData> {
    return { name: form.name.trim() };
}
