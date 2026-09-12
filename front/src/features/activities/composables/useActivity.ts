import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { materialsOf, resourcesOf, type ActivityData } from '@features/activities/model/activity';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

/**
 * One activity, loaded from the `id` in the route and reloaded whenever it changes.
 *
 * Watching the param rather than loading once on mount matters because vue-router reuses the
 * component when only the parameter changes — navigating from one activity to another would
 * otherwise leave the previous one on screen.
 */
export function useActivity() {
    const route = useRoute();
    const activity = ref<ActivityData | null>(null);

    watch(
        () => route.params.id,
        async (id) => {
            if (typeof id !== 'string') return;
            activity.value = await activities.getById(id);
        },
        { immediate: true },
    );

    return {
        activity,
        materials: computed(() => materialsOf(activity.value)),
        resources: computed(() => resourcesOf(activity.value)),
    };
}
