import { profileApi } from '@features/user/api/profile.api';
import { useAuth } from '@features/user/composables/useAuth';
import { withFavoriteToggled } from '@features/user/models/user';

/** The signed-in user's favourite activities, kept as a list on their own record. */
export function useFavorites() {
    const auth = useAuth();

    /** Reactive in a template, as it reads the session. */
    function isFavorite(activity: string): boolean {
        return auth.current.value?.favorites?.includes(activity) ?? false;
    }

    async function toggleFavorite(activity: string) {
        const favorites = withFavoriteToggled(auth.current.value?.favorites ?? [], activity);
        await profileApi.update(auth.currentId(), { favorites });
        // The session holds a copy of the user: read it again so `isFavorite` sees the change.
        await auth.refresh();
    }

    return { isFavorite, toggleFavorite };
}
