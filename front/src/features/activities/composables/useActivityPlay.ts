import { useActivity } from '@features/activities/composables/useActivity';
import { actionKey, playStepsOf, type PlayStep } from '@features/activities/model/play';
import { computed, ref, watch } from 'vue';

/**
 * Running one activity: its steps one at a time, and the actions ticked along the way. A run
 * lives in memory only — leaving the screen, or loading another activity, starts it over.
 */
export function useActivityPlay() {
    const { activity } = useActivity();

    const steps = computed(() => playStepsOf(activity.value));
    const index = ref(0);
    const ticked = ref(new Set<string>());

    watch(() => activity.value?.id, () => {
        index.value = 0;
        ticked.value = new Set();
    });

    /** Move to a step, staying within the run. */
    function goTo(target: number) {
        index.value = Math.min(Math.max(target, 0), Math.max(steps.value.length - 1, 0));
    }

    function toggle(step: PlayStep, actionIndex: number) {
        const key = actionKey(step, actionIndex);
        if (!ticked.value.delete(key)) ticked.value.add(key);
    }

    return {
        activity,
        steps,
        index,
        current: computed<PlayStep | undefined>(() => steps.value[index.value]),
        isFirst: computed(() => index.value === 0),
        isLast: computed(() => index.value >= steps.value.length - 1),
        goTo,
        previous: () => goTo(index.value - 1),
        next: () => goTo(index.value + 1),
        isTicked: (step: PlayStep, actionIndex: number) => ticked.value.has(actionKey(step, actionIndex)),
        toggle,
    };
}
