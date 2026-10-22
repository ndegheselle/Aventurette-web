import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useModal } from '@chapelure/ui/modals/useModal';
import { planningApi } from '@features/planning/api/planning.api';
import { planningEventsOf, type PlannedActivityData, type PlanningEvent } from '@features/planning/models/planning';
import { useAuth } from '@features/user/composables/useAuth';
import { ref, type ShallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

/** What of the calendar component this screen drives: asking it to read its events again. */
type Calendar = { getApi(): { refetchEvents(): void } };

/**
 * The planning screen: the user's plans over the dates the calendar shows, and the sheet opened
 * on one of them, from which it can be taken off.
 *
 * The calendar asks for its events itself, through `fetchEvents`, each time its dates change.
 * They are not handed to it as reactive options: the calendar re-applies options that change,
 * which moves its dates, which reads the events again — round and round.
 */
export function usePlanning(calendar: Readonly<ShallowRef<Calendar | null>>) {
    const userId = useAuth().currentId();
    const alert = useAlert();
    const { t } = useI18n();

    /** The plans the calendar last read, to find the one tapped. */
    const planned = ref<PlannedActivityData[]>([]);

    function reportFailure() {
        alert.error(t('validation.errors.default'));
    }

    // Moving through the calendar quickly sends a read before the last one is back. The calendar
    // ignores a late answer, and the backend client aborts the older read: only the last one
    // asked for may fill the list or report a failure.
    let lastAsked = 0;

    /** The calendar's event source: the plans starting in the dates it shows, `[start, end)`. */
    async function fetchEvents({ start, end }: { start: Date; end: Date }): Promise<PlanningEvent[]> {
        const asked = ++lastAsked;
        try {
            const found = await planningApi.between(userId, start, end);
            if (asked === lastAsked) planned.value = found;
            return planningEventsOf(found);
        } catch (error) {
            if (asked === lastAsked) reportFailure();
            throw error;
        }
    }

    function refresh() {
        calendar.value?.getApi().refetchEvents();
    }

    const sheet = useModal();
    const selected = ref<PlannedActivityData | null>(null);

    function select(id: string) {
        selected.value = planned.value.find(plan => plan.id === id) ?? null;
        if (selected.value) sheet.show();
    }

    async function restore(plan: PlannedActivityData) {
        await planningApi.create(plan);
        refresh();
    }

    /** Take the selected plan off. The toast's *Cancel* plans it again. */
    async function removeSelected() {
        const plan = selected.value;
        if (!plan) return;
        sheet.cancel();

        try {
            await planningApi.remove(plan.id);
        } catch {
            reportFailure();
            return;
        }

        refresh();
        alert.success(t('planning.removed'), {
            label: t('actions.cancel'),
            run: () => restore(plan).catch(reportFailure),
        });
    }

    return { fetchEvents, sheet, selected, select, removeSelected };
}
