import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { favoritesApi } from '@features/activities/api/favorites.api';
import type { ActivityData } from '@features/activities/models/activity';
import { withFavorite, withoutFavorite } from '@features/activities/models/favorites';
import { useAuth } from '@features/user/composables/useAuth';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

// Module state: one list, shared by every heart and the favorites tab, read once per user and
// kept in step with each change after that.
const favorites = ref<ActivityData[]>([]);
const loading = ref(false);
let loadedFor: string | null = null;

/** The signed-in user's favorite activities: the list, and adding or removing one. */
export function useFavorites() {
    const userId = useAuth().currentId();
    const alert = useAlert();
    const { t } = useI18n();

    function reportFailure() {
        alert.error(t('validation.errors.default'));
    }

    async function load() {
        loadedFor = userId;
        loading.value = true;
        try {
            const found = await favoritesApi.of(userId);
            // Another user may have signed in while this read was in flight.
            if (loadedFor === userId) favorites.value = found;
        } catch {
            // Read again by the next screen asking.
            loadedFor = null;
            reportFailure();
        } finally {
            loading.value = false;
        }
    }

    if (loadedFor !== userId) load();

    function isFavorite(activityId: string): boolean {
        return favorites.value.some(favorite => favorite.id === activityId);
    }

    async function save(activity: ActivityData) {
        await favoritesApi.add(userId, activity.id);
        favorites.value = withFavorite(favorites.value, activity);
    }

    async function add(activity: ActivityData) {
        await save(activity);
        alert.success(t('activities.favorites.added'));
    }

    async function remove(activity: ActivityData) {
        await favoritesApi.remove(userId, activity.id);
        favorites.value = withoutFavorite(favorites.value, activity.id);
        alert.success(t('activities.favorites.removed'), {
            label: t('actions.cancel'),
            // No toast of its own: the user is taking the removal back, not adding a favorite.
            run: () => save(activity).catch(reportFailure),
        });
    }

    /** Add the activity, or remove it if it is already a favorite. A toast says which. */
    function toggle(activity: ActivityData): Promise<void> {
        const change = isFavorite(activity.id) ? remove : add;
        return change(activity).catch(reportFailure);
    }

    return {
        favorites: computed(() => favorites.value),
        loading: computed(() => loading.value),
        isFavorite,
        toggle,
    };
}
