import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { rangeLabel } from '@chapelure/ui/inputs/range';
import { optionsFor, optionsOf, valuesOf, type Option } from '@chapelure/ui/inputs/selection';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import {
    ActivityLocation,
    ActivityPractice,
    ActivitySeason,
    columnOf,
    rangeEndOf,
    timingOf,
    type ActivityAudience,
    type ActivityData,
    type RangeEnd,
} from '@features/activities/model/activity';
import type { ActivityMaterialData, MaterialData } from '@features/activities/model/material';
import type { ActivityStepData } from '@features/activities/model/step';
import { tagOptions, type ActivityTagData } from '@features/activities/model/tag';
import type { ActivityWorkshopData } from '@features/activities/model/workshop';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { materialsApi as materials } from '@features/admin/activities-authoring/api/materials.api';
import { saveApi } from '@features/admin/activities-authoring/api/save.api';
import { tagsApi as tags } from '@features/admin/activities-authoring/api/tags.api';
import {
    activityWrites,
    createEmptyActivity,
    putById,
    stateTransition,
} from '@features/admin/activities-authoring/model/activity.edit';
import {
    canCreateMaterial,
    createCatalogueMaterial,
    createMaterialLink,
    materialSuggestions,
    withoutMaterial,
} from '@features/admin/activities-authoring/model/material.edit';
import { createEmptyStep } from '@features/admin/activities-authoring/model/step.edit';
import { createEmptyWorkshop } from '@features/admin/activities-authoring/model/workshop.edit';
import { useAuth } from '@features/auth/composables/useAuth';
import { computed, onMounted, ref, shallowRef, toRaw, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

/**
 * The activity the edit form is bound to, and what saving it does. Nothing is written before the
 * save — not the activity when it is new, not a step, a file, a material or a workshop: the form
 * holds them all, and the save sends them as one batch that lands whole or not at all.
 *
 * `activity` is never null, so the form can `v-model` straight onto it: an empty activity stands
 * in until the real one arrives.
 */
export function useActivityEdit() {
    const route = useRoute();
    const router = useRouter();
    const alert = useAlert();
    const { t } = useI18n();
    const { currentId } = useAuth();

    const activity = ref<ActivityData>(createEmptyActivity());

    /** The activity as it was read, which the save compares against. Null for one never saved. */
    const original = shallowRef<ActivityData | null>(null);
    const isNew = computed(() => original.value === null);

    /** Names added to the catalogue here. The save creates the ones a link still uses. */
    let newMaterials: MaterialData[] = [];

    const isChangingState = ref(false);

    watch(
        () => route.params.id,
        async (id) => {
            newMaterials = [];

            if (typeof id !== 'string') {
                original.value = null;
                activity.value = { ...createEmptyActivity(), id: saveApi.newId(), user: currentId() };
                return;
            }

            const read = await activities.getById(id) ?? createEmptyActivity();
            original.value = structuredClone(read);
            activity.value = read;
        },
        { immediate: true },
    );

    /** A blank step for the modal to fill in. It joins the activity when the modal is confirmed. */
    function newStep(): ActivityStepData {
        return createEmptyStep(saveApi.newId(), activity.value.id);
    }

    /** Take in a step the modal confirmed — a new one at the end, an edited one in its place. */
    function putStep(step: ActivityStepData) {
        activity.value.steps = putById(activity.value.steps, step);
    }

    /** Take a step off. The save deletes it, once the activity no longer lists it. */
    function removeStep(step: ActivityStepData) {
        activity.value.steps = activity.value.steps.filter(current => current.id !== step.id);
    }

    /** List a catalogue material, with no quantity yet. */
    function addMaterial(material: MaterialData) {
        const link = createMaterialLink(saveApi.newId(), activity.value.id, material);
        activity.value.materials = [...activity.value.materials, link];
    }

    /** Add a name the catalogue does not have, and list it. The save creates both. */
    function createMaterial(name: string) {
        const material = createCatalogueMaterial(saveApi.newId(), name);
        newMaterials = [...newMaterials, material];
        addMaterial(material);
    }

    /**
     * Take a material off this activity, and off every step and workshop that recalled it. The
     * save deletes the link; the catalogue material stays for the next activity.
     */
    function removeMaterial(material: ActivityMaterialData) {
        activity.value = withoutMaterial(activity.value, material.id);
    }

    /** A blank workshop for the modal to fill in, as `newStep`. */
    function newWorkshop(): ActivityWorkshopData {
        return createEmptyWorkshop(saveApi.newId(), activity.value.id, t('activities.workshops.untitled'));
    }

    function putWorkshop(workshop: ActivityWorkshopData) {
        activity.value.workshops = putById(activity.value.workshops, workshop);
    }

    function removeWorkshop(workshop: ActivityWorkshopData) {
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

    /**
     * A multi-valued field, as a `MultiSelect` binds it: every value as a translated option, and
     * the picked options over the values the field stores.
     */
    function choice<V extends string>(values: V[], labelKey: string, read: () => V[], write: (values: V[]) => void) {
        const options = computed(() => optionsOf(values, value => t(`${labelKey}.${value}`)));
        const picked = computed<Option<V>[]>({
            get: () => optionsFor(options.value, read()),
            set: picked => write(valuesOf(picked)),
        });
        return { options, picked };
    }

    const { options: practiceOptions, picked: practices } = choice(
        Object.values(ActivityPractice), 'activities.practice',
        () => activity.value.classification.practices,
        values => { activity.value.classification.practices = values; },
    );
    const { options: seasonOptions, picked: seasons } = choice(
        Object.values(ActivitySeason), 'activities.season',
        () => activity.value.place.seasons,
        values => { activity.value.place.seasons = values; },
    );
    const { options: locationOptions, picked: locations } = choice(
        Object.values(ActivityLocation), 'activities.location',
        () => activity.value.place.locations,
        values => { activity.value.place.locations = values; },
    );

    const timing = computed(() => timingOf(activity.value));

    /** Where the state button takes this activity, and what the button reads. */
    const transition = computed(() => stateTransition(activity.value.state));

    /**
     * Publish the activity, or put it back to draft. Writes the state and nothing else, so what
     * is typed into the form stays unsaved and still on screen. Failures alert rather than going
     * through `errors`: no field on the form stands for the state.
     *
     * Not for a new activity: there is no record yet to write the state to.
     */
    async function changeState() {
        if (isChangingState.value || isNew.value) return;

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
        const writes = activityWrites(original.value, toRaw(activity.value), newMaterials);
        await saveApi.send(writes);

        alert.success(t(isNew.value ? 'data.created' : 'data.updated'));
        router.push({ name: activitiesRoutesNames.page, params: { id: activity.value.id } });
    });

    return {
        activity,
        isNew,
        isLoading,
        isChangingState,
        transition,
        ageMin,
        ageMax,
        ageLabel,
        participantsMin,
        participantsMax,
        participantsLabel,
        practiceOptions,
        practices,
        seasonOptions,
        seasons,
        locationOptions,
        locations,
        timing,
        errors,
        save: submit,
        changeState,
        newStep,
        putStep,
        removeStep,
        addMaterial,
        createMaterial,
        removeMaterial,
        newWorkshop,
        putWorkshop,
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
 * The catalogue materials to offer while typing one, and whether what is typed is a new name.
 *
 * @param selected the activity's materials
 */
export function useMaterialCatalogue(selected: Ref<ActivityMaterialData[]>) {
    const known = ref<MaterialData[]>([]);
    const search = ref('');

    const suggestions = computed(() => materialSuggestions(known.value, selected.value, search.value));
    const isNewName = computed(() => canCreateMaterial(search.value, known.value, selected.value));

    onMounted(async () => {
        known.value = await materials.getAll();
    });

    return { search, suggestions, isNewName };
}
