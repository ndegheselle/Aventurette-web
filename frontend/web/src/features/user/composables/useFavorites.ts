import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { profileApi } from '@features/user/api/profile.api';
import { useAuth } from '@features/user/composables/useAuth';
import { favoritesOf, withFavorite, withoutFavorite } from '@features/user/models/user';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Module state, shared by every caller. A write sends the whole list, so each one has to start
// from the list the previous one left: two hearts tapped in a row would otherwise each send a
// list missing the other's change.
let queuedWrites: Promise<void> = Promise.resolve();

/** The signed-in user's favorite activities: which they are, and adding or removing one. */
export function useFavorites() {
    const auth = useAuth();
    const alert = useAlert();
    const { t } = useI18n();

    const favoriteIds = computed(() => favoritesOf(auth.current.value));

    function isFavorite(activityId: string): boolean {
        return favoriteIds.value.includes(activityId);
    }

    function save(change: (favorites: string[]) => string[]): Promise<void> {
        const write = queuedWrites.then(async () => {
            const favorites = change(favoriteIds.value);
            await profileApi.update(auth.currentId(), { favorites });
            // The session holds a copy of the user: read it again so every heart shows the change.
            await auth.refresh();
        });
        // A failed write must not block the ones queued after it.
        queuedWrites = write.catch(() => {});
        return write;
    }

    function reportFailure() {
        alert.error(t('validation.errors.default'));
    }

    async function add(activityId: string) {
        await save(favorites => withFavorite(favorites, activityId));
        alert.success(t('user.favorites.added'));
    }

    async function remove(activityId: string) {
        await save(favorites => withoutFavorite(favorites, activityId));
        alert.success(t('user.favorites.removed'), {
            label: t('actions.cancel'),
            // No toast of its own: the user is taking the removal back, not adding a favorite.
            run: () => save(favorites => withFavorite(favorites, activityId)).catch(reportFailure),
        });
    }

    /** Add the activity, or remove it if it is already a favorite. A toast says which. */
    function toggle(activityId: string): Promise<void> {
        const change = isFavorite(activityId) ? remove : add;
        return change(activityId).catch(reportFailure);
    }

    return { favoriteIds, isFavorite, toggle };
}
