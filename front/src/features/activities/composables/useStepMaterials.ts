import { useAlert } from '@chapelure/ui/composables/useAlert';
import { materialsApi as materials } from '@features/activities/api/materials.api';
import {
    canCreateMaterial,
    materialNameSuggestions,
    type ActivityMaterialData,
} from '@features/activities/model/material';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * The materials a step needs.
 *
 * A material belongs to one step, so choosing a name writes a row for this step — the names
 * already used elsewhere are suggestions, not records to link.
 *
 * @param selected the step's materials, as the input binds them
 * @param step id of the step they belong to, read on each write because the modal shows one
 *             step after another without being rebuilt
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
