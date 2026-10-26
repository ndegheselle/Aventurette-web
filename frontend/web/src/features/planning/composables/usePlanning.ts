import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useModal } from '@chapelure/ui/modals/useModal';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { planningApi } from '@features/planning/api/planning.api';
import { usePlanningPick } from '@features/planning/composables/usePlanningPick';
import {
    calendarTapOf,
    fromDateTimeInput,
    newPlanStart,
    planningEventsOf,
    toDateTimeInput,
    type PlannedActivityData,
    type PlanningEvent,
    type PlanningView,
} from '@features/planning/models/planning';
import { useAuth } from '@features/user/composables/useAuth';
import { computed, onMounted, ref, watch, type ShallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

/** What of the calendar component this screen drives: its events, its dates and its view. */
type Calendar = {
    getApi(): {
        refetchEvents(): void;
        addEvent(event: PlanningEvent & { className: string }): { remove(): void } | null;
        prev(): void;
        next(): void;
        today(): void;
        gotoDate(date: Date): void;
        changeView(view: string, date?: Date): void;
    };
};

/** What the calendar reports when its dates or its view change. */
type ShownDates = { view: { type: string; title: string; currentStart: Date; currentEnd: Date } };

/** What the calendar reports of a tap on it, outside an event. */
type CalendarClick = { date: Date; allDay: boolean };

/**
 * The planning screen: the user's plans over the dates the calendar shows, and the sheet opened
 * on one of them — or on a new one, drawn as a preview where it will land. From the sheet, the
 * plan's time changes, its activity is picked from the search, or it is taken off.
 *
 * The calendar asks for its events itself, through `fetchEvents`, each time its dates change.
 * They are not handed to it as reactive options: the calendar re-applies options that change,
 * which moves its dates, which reads the events again — round and round.
 */
export function usePlanning(calendar: Readonly<ShallowRef<Calendar | null>>) {
    const userId = useAuth().currentId();
    const alert = useAlert();
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const { pick, clear: clearPick } = usePlanningPick();

    // Back on the planning, whatever was being picked is not any more.
    clearPick();

    const api = () => calendar.value?.getApi();

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
        api()?.refetchEvents();
    }

    // The toolbar is the screen's own, not the calendar's: it reads what the calendar shows from
    // `onDatesSet` and moves it through its API.
    const title = ref('');
    const view = ref('');
    let shownFrom = new Date();
    let shownTo = new Date();

    function onDatesSet(shown: ShownDates) {
        title.value = shown.view.title;
        view.value = shown.view.type;
        shownFrom = shown.view.currentStart;
        shownTo = shown.view.currentEnd;
    }

    const prev = () => api()?.prev();
    const next = () => api()?.next();
    const today = () => api()?.today();
    const changeView = (to: PlanningView) => api()?.changeView(to);

    const sheet = useModal();
    /** The plan the sheet is open on; null for a new one. */
    const selected = ref<PlannedActivityData | null>(null);
    /** What the sheet's `datetime-local` input holds. */
    const start = ref('');
    const isNew = computed(() => selected.value === null);
    const canPick = computed(() => fromDateTimeInput(start.value) !== null);

    // A new plan is drawn where it will land until the sheet closes, and follows its time.
    let preview: { remove(): void } | null = null;

    function hidePreview() {
        preview?.remove();
        preview = null;
    }

    function showPreview(at: Date) {
        hidePreview();
        preview = api()?.addEvent({
            id: 'preview',
            title: t('planning.sheet.preview'),
            start: at,
            className: 'planning-preview',
        }) ?? null;
    }

    watch(start, (value) => {
        const at = fromDateTimeInput(value);
        if (sheet.isShown.value && isNew.value && at) showPreview(at);
    });

    async function openNew(at: Date) {
        selected.value = null;
        start.value = toDateTimeInput(at);
        api()?.gotoDate(at);
        showPreview(at);
        await sheet.show();
        hidePreview();
    }

    /** The plus button: a new plan at the next full hour, on the dates shown. */
    function addNew() {
        openNew(newPlanStart(new Date(), shownFrom, shownTo));
    }

    function open(plan: PlannedActivityData) {
        selected.value = plan;
        start.value = toDateTimeInput(plan.start);
        sheet.show();
    }

    function select(id: string) {
        const plan = planned.value.find(plan => plan.id === id);
        if (plan) open(plan);
    }

    /** A tap outside an event: the month opens the day, the other views plan at the time tapped. */
    function onDateClick({ date, allDay }: CalendarClick) {
        const tap = calendarTapOf(view.value, date, allDay, new Date());
        if (tap.kind === 'openDay') api()?.changeView('timeGridDay', tap.date);
        else openNew(tap.start);
    }

    /** The selected plan moved to the time the sheet holds. */
    async function moveSelected() {
        const plan = selected.value;
        const to = fromDateTimeInput(start.value);
        if (!plan || !to || to.getTime() === plan.start.getTime()) return;

        try {
            await planningApi.update(plan.id, { start: to });
        } catch {
            reportFailure();
            return;
        }
        plan.start = to;
        api()?.gotoDate(to);
        refresh();
    }

    /** Off to the search, to pick the activity of the new plan or another for the selected one. */
    function pickActivity() {
        const at = fromDateTimeInput(start.value);
        if (!at) return;
        pick.value = { start: at, planId: selected.value?.id ?? null };
        sheet.cancel();
        router.push({ name: activitiesRoutesNames.search });
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

    // Back from adding an activity, `?plan=` names the plan: the calendar goes to it and the sheet
    // opens on it. The query is dropped, so a reload does not open it again.
    onMounted(async () => {
        const id = route.query.plan;
        if (typeof id !== 'string') return;
        router.replace({ query: {} });

        const plan = await planningApi.getById(id).catch(() => null);
        if (!plan) return;
        api()?.gotoDate(plan.start);
        open(plan);
    });

    return {
        fetchEvents, title, view, onDatesSet, prev, next, today, changeView, onDateClick,
        sheet, selected, start, isNew, canPick, addNew, select, moveSelected, pickActivity, removeSelected,
    };
}
