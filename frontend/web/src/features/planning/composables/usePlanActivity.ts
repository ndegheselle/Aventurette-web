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

/** Planning an activity from the planning page: a sheet to find it and pick when, then the plan saved. */
export function usePlanActivity() {
    const userId = useAuth().currentId();
    const alert = useAlert();
    const { t } = useI18n();

    const picker = useModal();
    /** What the search input holds. */
    const search = ref('');
    const found = ref<ActivityData[]>([]);
    const chosen = ref<ActivityData | null>(null);
    /** What the `datetime-local` input holds. */
    const start = ref('');
    const canConfirm = computed(() => chosen.value !== null && fromDateTimeInput(start.value) !== null);

    function reportFailure() {
        alert.error(t('validation.errors.default'));
    }

    // Typing sends a search before the last is back, and the backend client aborts the older one:
    // only the last one asked for may fill the list or report a failure.
    let lastAsked = 0;

    async function find(text: string) {
        const asked = ++lastAsked;
        try {
            const activities = await planningApi.activitiesNamed(text);
            if (asked === lastAsked) found.value = activities;
        } catch {
            if (asked === lastAsked) reportFailure();
        }
    }

    function choose(activity: ActivityData) {
        chosen.value = activity;
    }

    /** Open the sheet; resolves true once a plan is saved, for the calendar to read it. */
    async function plan(): Promise<boolean> {
        search.value = '';
        chosen.value = null;
        start.value = toDateTimeInput(defaultPlanningStart(new Date()));
        void find('');

        const confirmed = await picker.show();
        const activity = chosen.value;
        const when = fromDateTimeInput(start.value);
        if (!confirmed || !activity || !when) return false;

        try {
            await planningApi.create(createPlannedActivity(userId, activity, when));
        } catch {
            reportFailure();
            return false;
        }

        alert.success(t('planning.added'));
        return true;
    }

    return { picker, search, found, chosen, start, canConfirm, find, choose, plan };
}
