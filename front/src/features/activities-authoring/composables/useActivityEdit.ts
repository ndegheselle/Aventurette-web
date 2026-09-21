import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { stepsApi as steps } from '@features/activities-authoring/api/steps.api';
import { createEmptyActivity, type ActivityData } from '@features/activities/model/activity';
import { createEmptyStep, type ActivityStepData } from '@features/activities/model/step';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { stateTransition } from '@features/activities-authoring/model/activity.edit';
import { computed, ref, toRaw, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

/**
 * The activity the edit form is bound to, and what saving it does. Saving writes the activity's
 * own fields only — it already exists by the time this screen opens, and so does every step.
 *
 * `activity` is never null, so the form can `v-model` straight onto it: an empty activity stands
 * in until the real one arrives.
 */
export function useActivityEdit() {
    const route = useRoute();
    const router = useRouter();
    const alert = useAlert();
    const { t } = useI18n();

    const activity = ref<ActivityData>(createEmptyActivity());
    const isAddingStep = ref(false);
    const isChangingState = ref(false);

    watch(
        () => route.params.id,
        async (id) => {
            if (typeof id !== 'string') return;

            activity.value = await activities.getById(id) ?? createEmptyActivity();
        },
        { immediate: true },
    );

    /**
     * Write a blank step, link it to the activity, and hand it back for the modal to fill in.
     * Null when the write failed — the caller's cue not to open the modal on nothing.
     */
    async function addStep(): Promise<ActivityStepData | null> {
        if (isAddingStep.value) return null;

        isAddingStep.value = true;
        try {
            const created = await steps.create(createEmptyStep(activity.value.id));
            return await relinkSteps([...activity.value.steps, created]) ? created : null;
        } catch {
            alert.error(t('validation.errors.default'));
            return null;
        } finally {
            isAddingStep.value = false;
        }
    }

    /** Take in a step the modal has just updated. Nothing to write: the modal already did. */
    function replaceStep(step: ActivityStepData) {
        activity.value.steps = activity.value.steps.map(
            current => current.id === step.id ? step : current,
        );
    }

    /**
     * Unlink a step, then delete it — in that order, never the other way round.
     *
     * `activities.steps` cascades: PocketBase deletes the record *holding* the relation once the
     * deleted id leaves it with none, so removing a still-linked last step takes the activity too.
     */
    async function detachStep(step: ActivityStepData) {
        if (!await relinkSteps(activity.value.steps.filter(current => current.id !== step.id)))
            return;

        try {
            await steps.remove(step.id);
        } catch {
            // The step is already unlinked; an unreferenced record is worth reporting, not
            // worth putting the step back for.
            alert.error(t('validation.errors.default'));
        }
    }

    /**
     * Write the activity's step list. A save of its own — nothing on the form is involved — so a
     * failure alerts and rolls the list back to what the record still holds.
     */
    async function relinkSteps(next: ActivityStepData[]): Promise<boolean> {
        const previous = activity.value.steps;
        activity.value.steps = next;

        try {
            await activities.update(activity.value.id, { steps: next });
            return true;
        } catch {
            activity.value.steps = previous;
            alert.error(t('validation.errors.default'));
            return false;
        }
    }

    /** Where the state button takes this activity, and what the button reads. */
    const transition = computed(() => stateTransition(activity.value.state));

    /**
     * Publish the activity, or put it back to draft. Writes the state and nothing else, so what
     * is typed into the form stays unsaved and still on screen. Failures alert rather than going
     * through `errors`: no field on the form stands for the state.
     */
    async function changeState() {
        if (isChangingState.value) return;

        const { to } = transition.value;

        isChangingState.value = true;
        try {
            await activities.update(activity.value.id, { state: to });
            activity.value.state = to;
            alert.success(t('data.updated'));
        } catch {
            alert.error(t('validation.errors.default'));
        } finally {
            isChangingState.value = false;
        }
    }

    const { isLoading, errors, submit } = useSubmit(async () => {
        await activities.update(activity.value.id, toRaw(activity.value));

        alert.success(t('data.updated'));
        router.push({ name: activitiesRoutesNames.page, params: { id: activity.value.id } });
    });

    return {
        activity,
        isLoading,
        isAddingStep,
        isChangingState,
        transition,
        errors,
        save: submit,
        changeState,
        addStep,
        replaceStep,
        detachStep,
    };
}
