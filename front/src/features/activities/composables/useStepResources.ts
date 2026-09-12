import { useAlert } from '@chapelure/ui/composables/useAlert';
import { resourcesApi as resources } from '@features/activities/api/resources.api';
import type { ActivityResourceData } from '@features/activities/model/activity';
import { filesWithinLimit, MAX_STEP_RESOURCES } from '@features/activities/model/resource';
import type { Ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * The files a step carries.
 *
 * A picked file is uploaded there and then, so what the step holds is always records — the
 * step is saved with their ids and never has to carry an upload of its own.
 *
 * @param selected the step's resources, as the input binds them
 * @param step id of the step they belong to, read on each upload because the modal shows one
 *             step after another without being rebuilt
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
