import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { materialsApi as materials, resourcesApi as resources } from '@features/activities-authoring/api/steps.api';
import {
    canCreateMaterial,
    filesWithinLimit,
    materialNameSuggestions,
    MAX_STEP_RESOURCES,
} from '@features/activities-authoring/model/step.edit';
import type { ActivityMaterialData, ActivityResourceData } from '@features/activities/model/step';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * What a step carries: the materials it needs and the files attached to it. Both are records of
 * the step's own, written the moment they are chosen, and edited from the same modal.
 *
 * Pass `step` as a getter: the modal shows one step after another without being rebuilt, so the
 * id has to be read on each write rather than captured.
 */

/**
 * The materials a step needs. Choosing a name writes a row for this step — names used elsewhere
 * are suggestions, not records to link.
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
     * Unlink a material. The record is left to `back/hooks`, which reclaims one no step lists any
     * more — `activities_steps.materials` cascades, so deleting it here would take the step too.
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
 * The files a step carries. A picked file is uploaded on the spot, so `selected` always holds
 * records and the step is saved with their ids.
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
     * Unlink a resource. The record is left to `back/hooks`, which reclaims one no step lists any
     * more — `activities_steps.resources` cascades, so deleting it here would take the step too.
     */
    function remove(index: number) {
        selected.value = selected.value.filter((_, i) => i !== index);
    }

    return { add, remove };
}
