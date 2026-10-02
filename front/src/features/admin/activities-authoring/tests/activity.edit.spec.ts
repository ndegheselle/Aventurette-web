import { isFilterGroup, type Filter } from '@chapelure/core';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
import {
    activityWrites,
    buildAuthoredFilters,
    putById,
    saveErrors,
    stateTransition,
    type ActivityWrite,
} from '@features/admin/activities-authoring/model/activity.edit';
import { aCatalogueMaterial, aMaterial, anActivity, aPickedFile, aResource, aStep, aWorkshop } from '@tests';
import { describe, expect, it } from 'vitest';

/** The filters of the group, which is all this query ever builds — no nesting. */
function filtersOf(group: ReturnType<typeof buildAuthoredFilters>): Filter<ActivityData>[] {
    return group.filters.filter((f): f is Filter<ActivityData> => !isFilterGroup(f));
}

function valueOf(group: ReturnType<typeof buildAuthoredFilters>, key: keyof ActivityData) {
    return filtersOf(group).find(f => f.key === key)?.value;
}

describe('stateTransition', () => {
    it('offers to publish a draft', () => {
        const { to, label } = stateTransition(ActivityState.DRAFT);

        expect(to).toBe(ActivityState.PUBLISHED);
        expect(label).toBe('activities.authoring.publish');
    });

    it('offers to take a published activity back to draft', () => {
        const { to, label } = stateTransition(ActivityState.PUBLISHED);

        expect(to).toBe(ActivityState.DRAFT);
        expect(label).toBe('activities.authoring.unpublish');
    });

    it('offers the forward move for any state that is not published', () => {
        // The button should stay publishable for a state the enum grows later, rather than
        // falling through to one that undoes something.
        const { to } = stateTransition('ARCHIVED' as ActivityData['state']);

        expect(to).toBe(ActivityState.PUBLISHED);
    });
});

describe('buildAuthoredFilters', () => {
    it('drops the state filter on the "all" tab, so it takes the same path as a chosen one', () => {
        const group = buildAuthoredFilters(null);

        expect(filtersOf(group)).toEqual([]);
    });

    it('narrows to one state when a tab is picked', () => {
        const group = buildAuthoredFilters(ActivityState.DRAFT);

        expect(valueOf(group, 'state')).toBe(ActivityState.DRAFT);
    });
});

describe('putById', () => {
    it('replaces the record sharing the id, in place, and adds one it does not hold at the end', () => {
        const first = aStep({ id: 'stp-1', title: 'Before' });
        const second = aStep({ id: 'stp-2' });
        const edited = { ...first, title: 'After' };
        const added = aStep({ id: 'stp-3' });

        expect(putById([first, second], edited)).toEqual([edited, second]);
        expect(putById([first, second], added)).toEqual([first, second, added]);
    });
});

// A save is one batch, and the backend runs it in order: a write may only point at records that
// exist by then, and a delete must not leave `activities.steps` cascading onto the activity.

/** Each write as `kind record`, which is enough to read an order off. */
function summary(writes: ActivityWrite[]): string[] {
    return writes.map(write => `${write.kind} ${write.record}`);
}

/** Where the first write matching `predicate` sits, so two of them can be ordered. */
function position(writes: ActivityWrite[], predicate: (write: ActivityWrite) => boolean): number {
    const index = writes.findIndex(predicate);
    if (index === -1) throw new Error('no such write');
    return index;
}

const removing = (record: string, id: string) =>
    (write: ActivityWrite) => write.kind === 'remove' && write.record === record && write.id === id;

describe('activityWrites', () => {
    describe('a new activity', () => {
        it('is created bare, before what points at it, and lists them in a last update', () => {
            const link = aMaterial({ id: 'amt-1', activity: 'act-1' });
            const step = aStep({ id: 'stp-1', activity: 'act-1', materials: [link] });
            const workshop = aWorkshop({ id: 'wks-1', activity: 'act-1' });
            const activity = anActivity({ id: 'act-1', materials: [link], steps: [step], workshops: [workshop] });

            const writes = activityWrites(null, activity);

            expect(summary(writes)).toEqual([
                'create activity',
                'create material',
                'create step',
                'create workshop',
                'update activity',
            ]);
            expect(writes[0]).toMatchObject({ data: { steps: [], materials: [], workshops: [] } });
            expect(writes[4]).toMatchObject({ data: { steps: [step], materials: [link], workshops: [workshop] } });
        });

        it('creates a step without its files, then lists them once they are created', () => {
            // A file points at its step, and a step can only list a file that exists.
            const resource = aResource({ id: 'res-1', step: 'stp-1', file: aPickedFile() });
            const step = aStep({ id: 'stp-1', resources: [resource] });

            const writes = activityWrites(null, anActivity({ steps: [step] }));

            expect(summary(writes)).toEqual([
                'create activity',
                'create step',
                'create resource',
                'update step',
                'update activity',
            ]);
            expect(writes[1]).toMatchObject({ data: { resources: [] } });
            expect(writes[3]).toEqual({ record: 'step', kind: 'update', id: 'stp-1', data: { id: 'stp-1', resources: [resource] } });
        });

        it('carries a cover on its update', () => {
            const cover = aPickedFile();

            const writes = activityWrites(null, anActivity(), [], cover);

            expect(writes.at(-1)).toMatchObject({ record: 'activity', kind: 'update', visual: cover });
        });
    });

    describe('an activity already saved', () => {
        it('writes the activity alone when nothing under it changed', () => {
            const activity = anActivity({ materials: [aMaterial()], steps: [aStep()], workshops: [aWorkshop()] });

            expect(summary(activityWrites(activity, structuredClone(activity)))).toEqual(['update activity']);
        });

        it('updates what changed, and only that', () => {
            const kept = aStep({ id: 'stp-1' });
            const changed = aStep({ id: 'stp-2', title: 'Before' });
            const original = anActivity({ steps: [kept, changed] });
            const edited = { ...structuredClone(original), steps: [kept, { ...changed, title: 'After' }] };

            const writes = activityWrites(original, edited);

            expect(summary(writes)).toEqual(['update step', 'update activity']);
            expect(writes[0]).toMatchObject({ id: 'stp-2', data: { title: 'After' } });
        });

        it('uploads a file picked for an existing step before the step lists it', () => {
            const step = aStep({ id: 'stp-1', resources: [aResource({ id: 'res-1' })] });
            const original = anActivity({ steps: [step] });
            const picked = aResource({ id: 'res-2', step: 'stp-1', file: aPickedFile() });
            const edited = { ...original, steps: [{ ...step, resources: [...step.resources, picked] }] };

            const writes = activityWrites(original, edited);

            expect(summary(writes)).toEqual(['create resource', 'update step', 'update activity']);
            expect(writes[0]).toMatchObject({ data: { id: 'res-2' } });
        });

        it('deletes a step only once the activity no longer lists it', () => {
            // activities.steps cascades: a deleted step still listed — the last one — takes the
            // activity with it.
            const step = aStep({ id: 'stp-1' });
            const original = anActivity({ steps: [step] });

            const writes = activityWrites(original, { ...original, steps: [] });

            expect(summary(writes)).toEqual(['update activity', 'remove step']);
            expect(writes[0]).toMatchObject({ data: { steps: [] } });
        });

        it('deletes a material link after every step and workshop has let go of it', () => {
            const link = aMaterial({ id: 'amt-1' });
            const step = aStep({ id: 'stp-1', materials: [link] });
            const workshop = aWorkshop({ id: 'wks-1', materials: [link] });
            const original = anActivity({ materials: [link], steps: [step], workshops: [workshop] });
            const edited = {
                ...original,
                materials: [],
                steps: [{ ...step, materials: [] }],
                workshops: [{ ...workshop, materials: [] }],
            };

            const writes = activityWrites(original, edited);

            const unlinked = Math.max(
                position(writes, write => write.kind === 'update' && write.record === 'step'),
                position(writes, write => write.kind === 'update' && write.record === 'workshop'),
                position(writes, write => write.kind === 'update' && write.record === 'activity'),
            );
            expect(position(writes, removing('material', 'amt-1'))).toBeGreaterThan(unlinked);
        });

        it('deletes a removed workshop', () => {
            const workshop = aWorkshop({ id: 'wks-1' });
            const original = anActivity({ workshops: [workshop] });

            const writes = activityWrites(original, { ...original, workshops: [] });

            expect(writes.some(removing('workshop', 'wks-1'))).toBe(true);
        });
    });

    describe('a name added to the catalogue', () => {
        it('is created before the link pointing at it', () => {
            const rope = aCatalogueMaterial({ id: 'mat-1', name: 'Rope' });
            const link = aMaterial({ id: 'amt-1', material: 'mat-1' });
            const original = anActivity();

            const writes = activityWrites(original, { ...original, materials: [link] }, [rope]);

            expect(summary(writes)).toEqual(['create catalogue', 'create material', 'update activity']);
        });

        it('is not created once nothing links it any more', () => {
            // Picked, then taken off again before the save.
            const rope = aCatalogueMaterial({ id: 'mat-1', name: 'Rope' });
            const original = anActivity();

            expect(summary(activityWrites(original, original, [rope]))).toEqual(['update activity']);
        });
    });
});

describe('saveErrors', () => {
    const fields = { title: { code: 'validation_required' } };

    it('keeps the activity\'s own errors on its fields', () => {
        const write: ActivityWrite = { record: 'activity', kind: 'update', id: 'act-1', data: {} };

        expect(saveErrors(write, { name: { code: 'validation_required' } })).toEqual({ name: { code: 'validation_required' } });
    });

    it('puts another record\'s first error under the list holding it', () => {
        const step: ActivityWrite = { record: 'step', kind: 'create', data: aStep() };
        const resource: ActivityWrite = { record: 'resource', kind: 'create', data: aResource() };
        const catalogue: ActivityWrite = { record: 'catalogue', kind: 'create', data: aCatalogueMaterial() };

        expect(saveErrors(step, fields)).toEqual({ steps: { code: 'validation_required' } });
        expect(saveErrors(resource, fields)).toEqual({ steps: { code: 'validation_required' } });
        expect(saveErrors(catalogue, fields)).toEqual({ materials: { code: 'validation_required' } });
    });

    it('passes the errors through when the backend named no write', () => {
        expect(saveErrors(undefined, fields)).toEqual(fields);
    });
});
