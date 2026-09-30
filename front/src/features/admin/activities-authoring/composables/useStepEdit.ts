import { useAlert } from '@chapelure/ui/alerts/useAlert';
import type { ActivityResourceData } from '@features/activities/model/step';
import { resourcesApi as resources } from '@features/admin/activities-authoring/api/steps.api';
import { filesWithinLimit, MAX_STEP_RESOURCES } from '@features/admin/activities-authoring/model/step.edit';
import { type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * The files a step carries. A picked file is uploaded on the spot, so `selected` always holds
 * records and the step is saved with their ids.
 *
 * `step` is a getter: the modal shows one step after another without being rebuilt, so the id
 * has to be read on each write rather than captured.
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
