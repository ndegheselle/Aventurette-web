import { plannedActivityMapper, toBackendDate, type PlannedActivityPayload } from '@features/planning/api/plannedActivity.mapper';
import {
    calendarTapOf,
    defaultPlanningStart,
    fromDateTimeInput,
    newPlanStart,
    planningEventsOf,
    planningWriteOf,
    toDateTimeInput,
    type PlannedActivityData,
} from '@features/planning/models/planning';
import { anActivity, anActivityPayload, aStep, fakeFileUrls } from '@tests';
import { describe, expect, it } from 'vitest';

function aPlan(overrides: Partial<PlannedActivityData> = {}): PlannedActivityData {
    return {
        id: 'plan-1',
        user: 'usr-1',
        activity: anActivity({ name: 'Treasure hunt' }),
        start: new Date(2026, 9, 22, 14, 0),
        ...overrides,
    };
}

describe('planningEventsOf', () => {
    it('ends an event when the activity\'s steps, preparation included, add up to', () => {
        const activity = anActivity({ steps: [aStep({ duration: 15 }), aStep({ duration: 30 })] });

        const [event] = planningEventsOf([aPlan({ activity })]);

        expect(event?.end).toEqual(new Date(2026, 9, 22, 14, 45));
    });

    it('leaves the end to the calendar when the activity has no duration', () => {
        const [event] = planningEventsOf([aPlan({ activity: anActivity({ steps: [] }) })]);

        expect(event).not.toHaveProperty('end');
    });

    it('leaves out a plan whose activity was not read', () => {
        const events = planningEventsOf([aPlan({ id: 'plan-1', activity: null }), aPlan({ id: 'plan-2' })]);

        expect(events.map(event => event.id)).toEqual(['plan-2']);
    });
});

describe('the date and time picker', () => {
    it('shows a date in local time, to the minute', () => {
        expect(toDateTimeInput(new Date(2026, 0, 5, 9, 7, 42))).toBe('2026-01-05T09:07');
    });

    it('reads what it holds back as the local time the user picked', () => {
        expect(fromDateTimeInput('2026-01-05T09:07')).toEqual(new Date(2026, 0, 5, 9, 7));
    });

    it('reads an empty or half-typed value as no date', () => {
        expect(fromDateTimeInput('')).toBeNull();
        expect(fromDateTimeInput('2026-01-')).toBeNull();
    });

    it('opens on the next full hour', () => {
        expect(defaultPlanningStart(new Date(2026, 9, 22, 23, 40))).toEqual(new Date(2026, 9, 23, 0, 0));
    });
});

describe('plannedActivityMapper', () => {
    const files = fakeFileUrls();

    it('reads the date PocketBase stores, and the activity whole', () => {
        const payload = {
            id: 'plan-1',
            user: 'usr-1',
            activity: 'act-1',
            start: '2026-10-22 12:30:00.000Z',
            expand: { activity: anActivityPayload({ id: 'act-1' }) },
        } as PlannedActivityPayload;

        const plan = plannedActivityMapper.toEntity(payload, files);

        expect(plan.start).toEqual(new Date(Date.UTC(2026, 9, 22, 12, 30)));
        expect(plan.activity?.id).toBe('act-1');
    });

    it('reads an unexpanded activity as none rather than as its id', () => {
        const payload = { id: 'plan-1', user: 'usr-1', activity: 'act-1', start: '2026-10-22 12:30:00.000Z' } as PlannedActivityPayload;

        expect(plannedActivityMapper.toEntity(payload, files).activity).toBeNull();
    });

    it('writes the activity as its id and the date as PocketBase compares it', () => {
        const start = new Date(Date.UTC(2026, 9, 22, 12, 30));

        const payload = plannedActivityMapper.toPayload(aPlan({ activity: anActivity({ id: 'act-1' }), start }));

        expect(payload).toEqual({ user: 'usr-1', activity: 'act-1', start: '2026-10-22 12:30:00.000Z' });
    });

    it('writes a range bound the way dates are stored, so the comparison sorts right', () => {
        expect(toBackendDate(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-01-01 00:00:00.000Z');
    });
});

describe('calendarTapOf', () => {
    const now = new Date(2026, 9, 26, 14, 20);
    const tapped = new Date(2026, 9, 22, 10, 30);

    it('opens the day tapped in the month', () => {
        expect(calendarTapOf('dayGridMonth', tapped, true, now)).toEqual({ kind: 'openDay', date: tapped });
    });

    it('plans at the time tapped in the other views', () => {
        expect(calendarTapOf('timeGridWeek', tapped, false, now)).toEqual({ kind: 'plan', start: tapped });
        expect(calendarTapOf('timeGridDay', tapped, false, now)).toEqual({ kind: 'plan', start: tapped });
    });

    it('plans on the all-day row at the hour a new plan would start now', () => {
        const day = new Date(2026, 9, 22);
        expect(calendarTapOf('timeGridWeek', day, true, now)).toEqual({ kind: 'plan', start: new Date(2026, 9, 22, 15, 0) });
    });
});

describe('newPlanStart', () => {
    const now = new Date(2026, 9, 26, 14, 20);

    it('starts at the next full hour when today is shown', () => {
        expect(newPlanStart(now, new Date(2026, 9, 26), new Date(2026, 10, 2))).toEqual(new Date(2026, 9, 26, 15, 0));
    });

    it('starts on the first day shown, at that hour, when today is not', () => {
        expect(newPlanStart(now, new Date(2026, 10, 9), new Date(2026, 10, 16))).toEqual(new Date(2026, 10, 9, 15, 0));
    });

    it('does not count the end of the dates shown as shown', () => {
        expect(newPlanStart(now, new Date(2026, 9, 25), new Date(2026, 9, 26))).toEqual(new Date(2026, 9, 25, 15, 0));
    });
});

describe('planningWriteOf', () => {
    const now = new Date(2026, 9, 26, 14, 20);
    const activity = anActivity({ name: 'Treasure hunt' });

    it('plans at the next full hour when nothing was being picked', () => {
        expect(planningWriteOf(null, 'usr-1', activity, now)).toEqual({
            kind: 'create',
            plan: { id: '', user: 'usr-1', activity, start: new Date(2026, 9, 26, 15, 0) },
        });
    });

    it('plans at the time picked for a new plan', () => {
        const start = new Date(2026, 10, 3, 9, 0);
        expect(planningWriteOf({ start, planId: null }, 'usr-1', activity, now)).toEqual({
            kind: 'create',
            plan: { id: '', user: 'usr-1', activity, start },
        });
    });

    it('changes the activity of the plan picked for, rather than adding one', () => {
        const pick = { start: new Date(2026, 10, 3, 9, 0), planId: 'plan-1' };
        expect(planningWriteOf(pick, 'usr-1', activity, now)).toEqual({ kind: 'change', id: 'plan-1', activity });
    });
});
