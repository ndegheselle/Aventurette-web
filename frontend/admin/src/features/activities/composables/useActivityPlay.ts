import { useActivity } from '@features/activities/composables/useActivity';
import { playStepIndexOf } from '@features/activities/models/play';
import type { ActivityStepData } from '@features/activities/models/step';
import { routesNames } from '@features/activities/routes';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, type Router } from 'vue-router';

/**
 * Running one activity: its steps one at a time. The current step is the route's 1-based `step`
 * param, replaced as the run moves so the whole run is one history entry.
 */
export function useActivityPlay() {
    const { activity } = useActivity();
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const steps = computed<ActivityStepData[]>(() => activity.value?.steps ?? []);
    const index = computed(() => playStepIndexOf(route.params.step, steps.value.length));

    /** Move to a step, staying within the run. */
    function goTo(target: number) {
        const position = playStepIndexOf(target + 1, steps.value.length) + 1;
        router.replace({ params: { ...route.params, step: String(position) } });
    }

    function leave() {
        if (!activity.value) return;
        returnToActivity(router, activity.value.id);
    }

    /** On to the feedback screen, in place of the run: leaving it then goes back past both. */
    function finish() {
        if (!activity.value) return;
        router.replace({ name: routesNames.feedback, params: { id: activity.value.id } });
    }

    /** What a step reads as: its own title, or else its kind's name. */
    function headingOf(step: ActivityStepData): string {
        return step.title || t(`activities.steps.kind.${step.kind}`);
    }

    return {
        activity,
        steps,
        index,
        current: computed<ActivityStepData | undefined>(() => steps.value[index.value]),
        isFirst: computed(() => index.value === 0),
        isLast: computed(() => index.value >= steps.value.length - 1),
        goTo,
        previous: () => goTo(index.value - 1),
        next: () => goTo(index.value + 1),
        leave,
        finish,
        headingOf,
    };
}

/**
 * Back to the activity page, popping the current entry so its own back does not return here.
 * Entered from elsewhere, the activity page replaces this one instead.
 */
export function returnToActivity(router: Router, activityId: string) {
    const target = router.resolve({ name: routesNames.activity, params: { id: activityId } });
    if (router.options.history.state.back === target.fullPath) router.back();
    else router.replace(target);
}
