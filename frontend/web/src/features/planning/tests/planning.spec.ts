import { plannedActivityMapper, toBackendDate, type PlannedActivityPayload } from '@features/planning/api/plannedActivity.mapper';
import {
    defaultPlanningStart,
    fromDateTimeInput,
    planningEventsOf,
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
