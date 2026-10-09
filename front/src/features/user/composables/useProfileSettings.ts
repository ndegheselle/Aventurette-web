import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { useAuth } from '@features/auth/composables/useAuth';
import { profileApi } from '@features/user/api/profile.api';
import { toProfileForm, toProfilePatch } from '@features/user/model/profile';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

/** The settings page: the signed-in user's profile as a form, and saving it. */
export function useProfileSettings() {
    const auth = useAuth();
    const alert = useAlert();
    const { t } = useI18n();

    const form = reactive(toProfileForm(auth.current.value));

    const { isLoading, errors, submit } = useSubmit(async () => {
        await profileApi.update(auth.currentId(), toProfilePatch(form));
        // The session holds a copy of the user: read it again so the navbar shows the new name.
        await auth.refresh();
        alert.success(t('data.updated'));
    });

    return { form, email: auth.current.value?.email ?? '', isLoading, errors, submit };
}
