import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useModal } from '@chapelure/ui/modals/useModal';
import type { ActivityData } from '@features/activities/models/activity';
import { planningApi } from '@features/planning/api/planning.api';
import {
    createPlannedActivity,
    defaultPlanningStart,
    fromDateTimeInput,
    toDateTimeInput,
} from '@features/planning/models/planning';
import { useAuth } from '@features/user/composables/useAuth';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

/** Planning one activity: a sheet to pick when, then the plan saved. */
export function usePlanActivity() {
    const userId = useAuth().currentId();
    const alert = useAlert();
    const { t } = useI18n();

    const picker = useModal();
    /** What the `datetime-local` input holds. */
    const start = ref('');
    const canConfirm = computed(() => fromDateTimeInput(start.value) !== null);

    async function plan(activity: ActivityData) {
        start.value = toDateTimeInput(defaultPlanningStart(new Date()));
        const confirmed = await picker.show();
        const when = fromDateTimeInput(start.value);
        if (!confirmed || !when) return;

        try {
            await planningApi.create(createPlannedActivity(userId, activity, when));
            alert.success(t('planning.added'));
        } catch {
            alert.error(t('validation.errors.default'));
        }
    }

    return { picker, start, canConfirm, plan };
}
