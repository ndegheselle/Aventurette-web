import { useAlert } from '@chapelure/ui/composables/useAlert';
import { materialsApi as materials, resourcesApi as resources } from '@features/activities-edit/api/steps.api';
import {
    canCreateMaterial,
    filesWithinLimit,
    materialNameSuggestions,
    MAX_STEP_RESOURCES,
    type ActivityMaterialData,
    type ActivityResourceData,
} from '@features/activities/model/step';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * What a step carries: the materials it needs and the files attached to it.
 *
 * Both are records of the step's own, both are written the moment they are chosen, and both are
 * edited from the same modal — which is why they are one file. The step id is read on each
 * write rather than captured, because the modal shows one step after another without being
 * rebuilt.
 */

/**
 * The materials a step needs.
 *
 * A material belongs to one step, so choosing a name writes a row for this step — the names
 * already used elsewhere are suggestions, not records to link.
 *
 * @param selected the step's materials, as the input binds them
 * @param step id of the step they belong to
 */
export function useStepMaterials(selected: Ref<ActivityMaterialData[]>, step: () => string) {
    const { t } = useI18n();
    const alert = useAlert();

    const known = ref<ActivityMaterialData[]>([]);
    const search = ref('');

    const suggestions = computed(() => materialNameSuggestions(known.value, selected.value, search.value));
    const isNewName = computed(() => canCreateMaterial(search.value, suggestions.value, selected.value));

    async function add(name: string) {
        try {
            const created = await materials.create(name, step());

            selected.value = [...selected.value, created];
            known.value = [...known.value, created];
            search.value = '';
        } catch {
            alert.error(t('validation.errors.default'));
        }
    }

    /**
     * Drop a material from the step.
     *
     * Only the link is dropped here. The record is left to `back/hooks`, which reclaims one no
     * step lists any more — deleting it from here would mean deleting a record the step still
     * points at, and `activities_steps.materials` cascades.
     */
    function remove(index: number) {
        selected.value = selected.value.filter((_, i) => i !== index);
    }

    onMounted(async () => {
        known.value = await materials.getAll();
    });

    return { search, suggestions, isNewName, add, remove };
}

/**
 * The files a step carries.
 *
 * A picked file is uploaded there and then, so what the step holds is always records — the
 * step is saved with their ids and never has to carry an upload of its own.
 *
 * @param selected the step's resources, as the input binds them
 * @param step id of the step they belong to
 */
export function useStepResources(selected: Ref<ActivityResourceData[]>, step: () => string) {
    const { t } = useI18n();
    const alert = useAlert();

    async function add(picked: File[]) {
        const { accepted, rejected } = filesWithinLimit(selected.value, picked);

        if (rejected)
            alert.error(t('inputs.file.upload.exceedNumber', { number: MAX_STEP_RESOURCES }));

        if (!accepted.length) return;

        try {
            const uploaded = await Promise.all(accepted.map(file => resources.upload(file, step())));
            selected.value = [...selected.value, ...uploaded];
        } catch {
            alert.error(t('activities.steps.fields.resources.uploadFailed'));
        }
    }

    /**
     * Drop a resource from the step.
     *
     * Only the link is dropped here. The record is left to `back/hooks`, which reclaims a
     * resource once no step lists it — deleting it from here would mean deleting a record the
     * step still points at, and `activities_steps.resources` cascades.
     */
    function remove(index: number) {
        selected.value = selected.value.filter((_, i) => i !== index);
    }

    return { add, remove };
}
