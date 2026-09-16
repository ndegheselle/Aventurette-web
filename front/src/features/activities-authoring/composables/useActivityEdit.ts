import { useAlert } from '@chapelure/ui/composables/useAlert';
import { useSubmit } from '@chapelure/ui/composables/useSubmit';
import { activitiesApi as activities, benefitsApi as benefits } from '@features/activities/api/activities.api';
import { stepsApi as steps } from '@features/activities-authoring/api/steps.api';
import { createEmptyActivity, type ActivityData, type BenefitData } from '@features/activities/model/activity';
import { createEmptyStep, type ActivityStepData } from '@features/activities/model/step';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { stateTransition } from '@features/activities-authoring/model/activity.edit';
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

/**
 * The activity the edit form is bound to, and what saving it does.
 *
 * The activity always exists by the time this screen opens — `useActivitiesEditList` creates it —
 * and so does every step, written blank the moment it is added. Nothing here creates anything on
 * save: what is left for the save button is the activity's own fields.
 *
 * Never null, so the form can bind `v-model` straight to the fields: an empty activity stands
 * in until the real one arrives. Watching the route param rather than loading once on mount,
 * because vue-router reuses the component when only the parameter changes.
 */
export function useActivityEdit() {
    const route = useRoute();
    const router = useRouter();
    const alert = useAlert();
    const { t } = useI18n();

    const activity = ref<ActivityData>(createEmptyActivity());
    const availableBenefits = ref<BenefitData[]>([]);
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
     * TagSelect picks from `availableBenefits` and tells what is selected apart by identity,
     * while the benefits the activity was loaded with are records of their own. Matching them
     * back by id is what keeps an already-chosen benefit out of the dropdown.
     */
    const selectedBenefits = computed({
        get: () => availableBenefits.value.filter(
            available => activity.value.benefits.some(chosen => chosen.id === available.id),
        ),
        set: (chosen: BenefitData[]) => {
            activity.value.benefits = chosen ?? [];
        },
    });

    /**
     * Add a step: write a blank one, link it to the activity, and hand it back for the modal
     * to fill in.
     *
     * Same reasoning as the activity itself — a step exists before it is edited, so what the
     * modal opens on is always a record, and the materials and files chosen in it have
     * something to belong to. Returns null when the write failed, which is the caller's cue
     * not to open the modal on nothing.
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
     * Unlink a step, then delete it — in that order, and never the other way round.
     *
     * `activities.steps` cascades on delete: PocketBase deletes the record holding the
     * relation once the deleted id leaves it with none, so removing an activity's last step
     * while it is still linked would take the activity with it.
     */
    async function detachStep(step: ActivityStepData) {
        if (!await relinkSteps(activity.value.steps.filter(current => current.id !== step.id)))
            return;

        try {
            await steps.remove(step.id);
        } catch {
            // The step is already off the activity; what is left behind is an unreferenced
            // record, which is worth reporting but not worth putting the step back for.
            alert.error(t('validation.errors.default'));
        }
    }

    /**
     * Write the activity's step list.
     *
     * Its own little save: nothing on the form is involved, so a failure is reported as an
     * alert and the list is put back to what the record still holds, rather than leaving the
     * screen showing a link that was never made.
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

    /** Where the state button will take this activity, and what the button should read. */
    const transition = computed(() => stateTransition(activity.value.state));

    /**
     * Publish the activity, or put it back to draft.
     *
     * Writes the state and nothing else, which is why it sits beside the save button rather
     * than inside it: what is typed into the form is still unsaved afterwards, and still on
     * screen to save. Reported as an alert rather than through `errors` — no field on the form
     * stands for the state, so there is nothing to show a message against.
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

    onMounted(async () => {
        availableBenefits.value = await benefits.getAll();
    });

    return {
        activity,
        availableBenefits,
        selectedBenefits,
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
