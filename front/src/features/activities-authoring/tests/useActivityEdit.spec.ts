import { useActivityEdit } from '@features/activities-authoring/composables/useActivityEdit';
import type { ActivityData } from '@features/activities/model/activity';
import type { ActivityStepData } from '@features/activities/model/step';
import { anActivity, aStep, createTestRouter, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The one composable here with an order in it: `activities.steps` cascades on delete, so
// unlinking a step before removing it is the difference between deleting a step and deleting the
// whole activity. Everything else is a ref and a call.

const activities = fakeCrud<ActivityData>();
const steps = fakeCrud<ActivityStepData>();
vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/activities-authoring/api/steps.api', () => ({
    get stepsApi() { return steps; },
}));

const routes = [
    { path: '/my-activities/:id', name: 'activities.authoring.page', component: { template: '<div/>' } },
    { path: '/activities/:id', name: 'activities.page', component: { template: '<div/>' } },
];

async function setup(id = 'act-1') {
    const router = await createTestRouter({ routes, initialRoute: `/my-activities/${id}` });
    const [subject] = withSetup(() => useActivityEdit(), router);
    await flushPromises();
    return subject;
}

/** The activity as the backend now holds it. */
function stored(id = 'act-1') {
    return activities.items.find(activity => activity.id === id);
}

beforeEach(() => {
    vi.restoreAllMocks();
    steps.items = [];
    activities.items = [anActivity({ id: 'act-1', steps: [] })];
});

describe('addStep', () => {
    it('writes a blank step and links it, so the modal opens on a record', async () => {
        const subject = await setup();

        const created = await subject.addStep();

        expect(created).not.toBeNull();
        expect(steps.items).toHaveLength(1);
        expect(stored()?.steps).toEqual([created]);
    });

    it('hands back nothing when the link could not be written', async () => {
        // The caller's cue not to open the modal on a step the activity does not claim.
        const subject = await setup();
        activities.failNextWith({});

        expect(await subject.addStep()).toBeNull();
    });
});

describe('detachStep', () => {
    it('unlinks the step before deleting it, never the other way round', async () => {
        // activities.steps cascades: PocketBase deletes the record *holding* the relation once
        // the deleted id leaves it with none, so a still-linked last step takes the activity too.
        const step = aStep({ id: 'stp-1' });
        activities.items = [anActivity({ id: 'act-1', steps: [step] })];
        steps.items = [step];

        const subject = await setup();
        const unlink = vi.spyOn(activities, 'update');
        const destroy = vi.spyOn(steps, 'remove');

        await subject.detachStep(step);

        expect(unlink).toHaveBeenCalled();
        expect(destroy).toHaveBeenCalledWith('stp-1');
        expect(unlink.mock.invocationCallOrder[0]!).toBeLessThan(destroy.mock.invocationCallOrder[0]!);
        expect(steps.items).toEqual([]);
    });

    it('puts the list back and deletes nothing when the unlink fails', async () => {
        // Better to report the failure than leave the screen claiming a link that was never made.
        const step = aStep({ id: 'stp-1' });
        activities.items = [anActivity({ id: 'act-1', steps: [step] })];
        steps.items = [step];

        const subject = await setup();
        activities.failNextWith({});
        const destroy = vi.spyOn(steps, 'remove');

        await subject.detachStep(step);

        expect(subject.activity.value.steps).toEqual([step]);
        expect(destroy).not.toHaveBeenCalled();
    });

    it('leaves the step off the activity when the unlink landed but the delete did not', async () => {
        // An unreferenced record is worth reporting, not worth putting the step back for.
        const step = aStep({ id: 'stp-1' });
        activities.items = [anActivity({ id: 'act-1', steps: [step] })];
        steps.items = [step];

        const subject = await setup();
        vi.spyOn(steps, 'remove').mockRejectedValue(new Error('nope'));

        await subject.detachStep(step);

        expect(subject.activity.value.steps).toEqual([]);
        expect(stored()?.steps).toEqual([]);
    });
});
