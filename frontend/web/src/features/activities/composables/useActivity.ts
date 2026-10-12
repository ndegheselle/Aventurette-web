import { rangeLabel } from '@chapelure/ui/inputs/range';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { ageRangeOf, participantsRangeOf, resourcesOf, timingOf, type ActivityData } from '@features/activities/model/activity';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

/**
 * One activity, loaded from the `id` in the route and reloaded whenever it changes. Watched
 * rather than loaded on mount: vue-router reuses the component when only the param changes.
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

    const ages = computed(() => ageRangeOf(activity.value?.audience));
    const participants = computed(() => participantsRangeOf(activity.value?.audience));

    return {
        activity,
        ageLabel: computed(() => rangeLabel(ages.value.min, ages.value.max)),
        participantsLabel: computed(() => rangeLabel(participants.value.min, participants.value.max)),
        resources: computed(() => resourcesOf(activity.value)),
        timing: computed(() => timingOf(activity.value)),
    };
}
