import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { filterDefaultsApi } from '@features/user/api/filterDefaults.api';
import { useAuth } from '@features/user/composables/useAuth';
import type { FilterDefaultsData } from '@features/user/models/user';
import { onMounted, ref } from 'vue';

/**
 * The filter defaults form, for the onboarding and the profile: read from the user record when
 * mounted, saved back to it. Either way the user counts as onboarded after, and the session is
 * refreshed so the guard knows. Where to go next is the screen's.
 */
export function useFilterDefaults() {
    const auth = useAuth();
    const defaults = ref<FilterDefaultsData | null>(null);

    onMounted(async () => {
        defaults.value = await filterDefaultsApi.of(auth.currentId());
    });

    async function store(changes: Partial<FilterDefaultsData>) {
        await filterDefaultsApi.save(auth.currentId(), { ...changes, onboarded: true });
        await auth.refresh();
    }

    const { isLoading, errors, submit: save } = useSubmit(async () => {
        if (defaults.value) await store(defaults.value);
    });

    /** The onboarding's *Later*: shown once all the same, nothing chosen. */
    const { submit: skip } = useSubmit(() => store({}));

    return { defaults, isLoading, errors, save, skip };
}
