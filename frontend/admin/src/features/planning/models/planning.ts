import { timingOf, type ActivityData } from '@features/activities/models/activity';

/** One time a user means to run an activity. The same activity may be planned any number of times. */
export type PlannedActivityData = {
    id: string;
    user: string;
    /** Null when the read did not expand it: the calendar has nothing to show for it. */
    activity: ActivityData | null;
    start: Date;
};

/** A plan added from an activity's page, before it is saved. */
export function createPlannedActivity(user: string, activity: ActivityData, start: Date): PlannedActivityData {
    return { id: '', user, activity, start };
}

/** What the calendar draws for a plan. Shaped as FullCalendar's event input, without its types. */
export type PlanningEvent = {
    id: string;
    title: string;
    start: Date;
    end?: Date;
};

/** The calendar's views the toolbar switches between, by FullCalendar's names. */
export const PLANNING_VIEWS = ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'] as const;
export type PlanningView = typeof PLANNING_VIEWS[number];

/** What tapping the calendar does: open the day tapped, or plan at the time tapped. */
export type CalendarTap =
    | { kind: 'openDay'; date: Date }
    | { kind: 'plan'; start: Date };

/**
 * From the month, a tap opens that day. Elsewhere it plans at the time tapped — on the all-day
 * row, which has no time, at the hour a new plan would start now.
 */
export function calendarTapOf(view: string, date: Date, allDay: boolean, now: Date): CalendarTap {
    if (view === 'dayGridMonth') return { kind: 'openDay', date };
    if (!allDay) return { kind: 'plan', start: date };
    return { kind: 'plan', start: atTimeOf(date, defaultPlanningStart(now)) };
}

/**
 * Where the plus button's plan starts: the next full hour when today is among the dates shown
 * (`[from, to)`), else the same hour on the first of them, so the new plan lands in sight.
 */
export function newPlanStart(now: Date, from: Date, to: Date): Date {
    const next = defaultPlanningStart(now);
    if (now >= from && now < to) return next;
    return atTimeOf(from, next);
}

/** `day`'s date at `time`'s hour and minutes. */
function atTimeOf(day: Date, time: Date): Date {
    const at = new Date(day);
    at.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return at;
}

/**
 * What the search is picking an activity for, from the planning: a new plan at `start`, or the
 * plan `planId`, whose activity is changed.
 */
export type PlanningPick = {
    start: Date;
    planId: string | null;
};

/** What adding an activity to the planning writes. */
export type PlanningWrite =
    | { kind: 'create'; plan: PlannedActivityData }
    | { kind: 'change'; id: string; activity: ActivityData };

/**
 * Adding an activity to the planning: what the planning picked it for, or, picked for nothing,
 * a new plan at the next full hour.
 */
export function planningWriteOf(pick: PlanningPick | null, user: string, activity: ActivityData, now: Date): PlanningWrite {
    if (pick?.planId) return { kind: 'change', id: pick.planId, activity };
    const start = pick?.start ?? defaultPlanningStart(now);
    return { kind: 'create', plan: createPlannedActivity(user, activity, start) };
}

const MINUTE_MS = 60_000;

/**
 * The calendar's events: one to a plan, as long as the activity's steps add up to. A plan whose
 * activity was not read is left out, and one with no duration gets the calendar's default length.
 */
export function planningEventsOf(planned: PlannedActivityData[]): PlanningEvent[] {
    const events: PlanningEvent[] = [];
    for (const plan of planned) {
        if (!plan.activity) continue;

        const event: PlanningEvent = { id: plan.id, title: plan.activity.name, start: plan.start };
        const minutes = timingOf(plan.activity).total;
        if (minutes > 0) event.end = new Date(plan.start.getTime() + minutes * MINUTE_MS);
        events.push(event);
    }
    return events;
}

/** Where a new plan starts: the next full hour, so the picker does not open on a time already gone. */
export function defaultPlanningStart(now: Date): Date {
    const next = new Date(now);
    next.setHours(now.getHours() + 1, 0, 0, 0);
    return next;
}

function twoDigits(value: number): string {
    return String(value).padStart(2, '0');
}

/**
 * A date as a `datetime-local` input holds it: local time, to the minute, with no zone.
 * `toISOString` would not do: it is UTC, so the picker would show another hour.
 */
export function toDateTimeInput(date: Date): string {
    const day = `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
    const time = `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
    return `${day}T${time}`;
}

const DATE_TIME_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * What a `datetime-local` input holds, as the local time the user picked. Null when it is empty
 * or not a date. Read field by field: `new Date` guesses at whatever it is given.
 */
export function fromDateTimeInput(value: string): Date | null {
    const match = DATE_TIME_INPUT.exec(value);
    if (!match) return null;

    const [year, month, day, hours, minutes] = match.slice(1).map(Number) as [number, number, number, number, number];
    return new Date(year, month - 1, day, hours, minutes);
}

/** When a plan starts, written out in full for the sheet opened on it. */
export function formatPlanStart(start: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(start);
}
