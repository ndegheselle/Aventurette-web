import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { rangeLabel } from '@chapelure/ui/inputs/range';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { materialsApi as materials } from '@features/activities-authoring/api/materials.api';
import { stepsApi as steps } from '@features/activities-authoring/api/steps.api';
import { tagsApi as tags } from '@features/activities-authoring/api/tags.api';
import { workshopsApi as workshops } from '@features/activities-authoring/api/workshops.api';
import { createEmptyActivity, stateTransition } from '@features/activities-authoring/model/activity.edit';
import {
    canCreateMaterial,
    materialNameSuggestions,
    withoutMaterial,
} from '@features/activities-authoring/model/material.edit';
import { createEmptyStep } from '@features/activities-authoring/model/step.edit';
import { createEmptyWorkshop } from '@features/activities-authoring/model/workshop.edit';
import {
    columnOf,
    rangeEndOf,
    timingOf,
    type ActivityAudience,
    type ActivityData,
    type RangeEnd,
} from '@features/activities/model/activity';
import type { ActivityMaterialData } from '@features/activities/model/material';
import type { ActivityStepData } from '@features/activities/model/step';
import { tagOptions, type ActivityTagData } from '@features/activities/model/tag';
import type { ActivityWorkshopData } from '@features/activities/model/workshop';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { computed, onMounted, ref, toRaw, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

/** The lists of records an activity links, each written on its own as it changes. */
type LinkedRecords = 'steps' | 'materials' | 'workshops';

/**
 * The activity the edit form is bound to, and what saving it does. Saving writes the activity's
 * own fields only — it already exists by the time this screen opens, and so does every step,
 * material and workshop.
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
    const isAddingWorkshop = ref(false);
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
     * Write one of the activity's lists of links. A save of its own — nothing on the form is
     * involved — so a failure alerts and rolls the list back to what the record still holds.
     */
    async function relink<K extends LinkedRecords>(field: K, next: ActivityData[K]): Promise<boolean> {
        const previous = activity.value[field];
        activity.value[field] = next;

        try {
            await activities.update(activity.value.id, { [field]: next } as Partial<ActivityData>);
            return true;
        } catch {
            activity.value[field] = previous;
            alert.error(t('validation.errors.default'));
            return false;
        }
    }

    /**
     * Write a blank step, link it to the activity, and hand it back for the modal to fill in.
     * Null when the write failed — the caller's cue not to open the modal on nothing.
     */
    async function addStep(): Promise<ActivityStepData | null> {
        if (isAddingStep.value) return null;

        isAddingStep.value = true;
        try {
            const created = await steps.create(createEmptyStep(activity.value.id));
            return await relink('steps', [...activity.value.steps, created]) ? created : null;
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
        if (!await relink('steps', activity.value.steps.filter(current => current.id !== step.id)))
            return;

        try {
            await steps.remove(step.id);
        } catch {
            // The step is already unlinked; an unreferenced record is worth reporting, not
            // worth putting the step back for.
            alert.error(t('validation.errors.default'));
        }
    }

    /** Write a material of this activity's own, then list it. */
    async function addMaterial(name: string) {
        try {
            const created = await materials.create(name, activity.value.id);
            await relink('materials', [...activity.value.materials, created]);
        } catch {
            alert.error(t('validation.errors.default'));
        }
    }

    /** Write a material's quantity, as it is typed: the activity's save does not reach it. */
    async function updateMaterial(material: ActivityMaterialData) {
        try {
            await materials.update(material);
        } catch {
            alert.error(t('validation.errors.default'));
        }
    }

    /**
     * Delete a material outright — no unlinking first, unlike a step: nothing linking a material
     * cascades, so the backend only drops it from the lists that held it.
     */
    async function removeMaterial(material: ActivityMaterialData) {
        try {
            await materials.remove(material.id);
        } catch {
            alert.error(t('validation.errors.default'));
            return;
        }

        activity.value = withoutMaterial(activity.value, material.id);
    }

    /** Write a blank workshop and link it, as `addStep` does. */
    async function addWorkshop(): Promise<ActivityWorkshopData | null> {
        if (isAddingWorkshop.value) return null;

        isAddingWorkshop.value = true;
        try {
            const created = await workshops.create(
                createEmptyWorkshop(activity.value.id, t('activities.workshops.untitled')),
            );
            return await relink('workshops', [...activity.value.workshops, created]) ? created : null;
        } catch {
            alert.error(t('validation.errors.default'));
            return null;
        } finally {
            isAddingWorkshop.value = false;
        }
    }

    function replaceWorkshop(workshop: ActivityWorkshopData) {
        activity.value.workshops = activity.value.workshops.map(
            current => current.id === workshop.id ? workshop : current,
        );
    }

    /** Delete a workshop outright: `activities.workshops` does not cascade, so no unlink first. */
    async function removeWorkshop(workshop: ActivityWorkshopData) {
        try {
            await workshops.remove(workshop.id);
        } catch {
            alert.error(t('validation.errors.default'));
            return;
        }

        activity.value.workshops = activity.value.workshops.filter(current => current.id !== workshop.id);
    }

    /**
     * One bound of the audience, as the slider binds it, over the field that stores it — the
     * slider's unset is `null`, the field's is 0.
     */
    function rangeEnd(bound: keyof Pick<ActivityAudience, 'ageMin' | 'ageMax' | 'participantsMin' | 'participantsMax'>) {
        return computed<RangeEnd>({
            get: () => rangeEndOf(activity.value.audience[bound]),
            set: value => { activity.value.audience[bound] = columnOf(value); },
        });
    }

    const ageMin = rangeEnd('ageMin');
    const ageMax = rangeEnd('ageMax');
    const ageLabel = computed(() => rangeLabel(ageMin.value, ageMax.value));

    const participantsMin = rangeEnd('participantsMin');
    const participantsMax = rangeEnd('participantsMax');
    const participantsLabel = computed(() => rangeLabel(participantsMin.value, participantsMax.value));

    const timing = computed(() => timingOf(activity.value));

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
        isAddingWorkshop,
        isChangingState,
        transition,
        ageMin,
        ageMax,
        ageLabel,
        participantsMin,
        participantsMax,
        participantsLabel,
        timing,
        errors,
        save: submit,
        changeState,
        addStep,
        replaceStep,
        detachStep,
        addMaterial,
        updateMaterial,
        removeMaterial,
        addWorkshop,
        replaceWorkshop,
        removeWorkshop,
    };
}

/**
 * Every tag, as each kind's picker offers them. Picking only changes the activity: the links are
 * written with the rest of the form, on save.
 */
export function useTagOptions() {
    const known = ref<ActivityTagData[]>([]);

    onMounted(async () => {
        known.value = await tags.getAll();
    });

    return { tagOptions: computed(() => tagOptions(known.value)) };
}

/**
 * The names to offer while typing a material, drawn from every activity's.
 *
 * @param selected the activity's materials
 */
export function useMaterialSuggestions(selected: Ref<ActivityMaterialData[]>) {
    const known = ref<ActivityMaterialData[]>([]);
    const search = ref('');

    const suggestions = computed(() => materialNameSuggestions(known.value, selected.value, search.value));
    const isNewName = computed(() => canCreateMaterial(search.value, suggestions.value, selected.value));

    onMounted(async () => {
        known.value = await materials.getAll();
    });

    return { search, suggestions, isNewName };
}
