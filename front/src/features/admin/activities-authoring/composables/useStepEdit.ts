import { useAlert } from '@chapelure/ui/alerts/useAlert';
import type { ActivityResourceData } from '@features/activities/model/step';
import { saveApi } from '@features/admin/activities-authoring/api/save.api';
import { createResource, filesWithinLimit, MAX_STEP_RESOURCES } from '@features/admin/activities-authoring/model/step.edit';
import { type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * The files a step carries. A picked file stays in the browser, as a resource carrying it, and
 * goes up with the activity's save — in the same batch as the step, so a step never points at a
 * file that was not stored, nor a file at a step that was not.
 *
 * `step` is a getter: the modal shows one step after another without being rebuilt, so the id
 * has to be read on each pick rather than captured.
 *
 * @param selected the step's resources, as the input binds them
 * @param step id of the step they belong to
 */
export function useStepResources(selected: Ref<ActivityResourceData[]>, step: () => string) {
    const { t } = useI18n();
    const alert = useAlert();

    function add(picked: File[]) {
        const { accepted, rejected } = filesWithinLimit(selected.value, picked);

        if (rejected)
            alert.error(t('inputs.file.upload.exceedNumber', { number: MAX_STEP_RESOURCES }));

        const resources = accepted.map(file => createResource(saveApi.newId(), step(), file, URL.createObjectURL(file)));
        selected.value = [...selected.value, ...resources];
    }

    /**
     * Unlink a resource. A stored one's record is left to `back/hooks`, which reclaims one no step
     * lists any more — `activities_steps.resources` cascades, so deleting it would take the step too.
     */
    function remove(index: number) {
        selected.value = selected.value.filter((_, i) => i !== index);
    }

    return { add, remove };
}
