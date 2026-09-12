import type { ActivityData, BenefitData } from '@features/activities/model/activity';
import type { ActivityStepData } from '@features/activities/model/step';
import { useActivityEdit } from '@features/activities/composables/useActivityEdit';
import { anActivity, aStep, createTestRouter, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The one composable in this feature with a spec, because it is the one with an order in it:
 * `activities.steps` cascades on delete, so unlinking a step before removing it is the
 * difference between deleting a step and deleting the whole activity. Everything else here is
 * a ref and a call.
 */

const activities = fakeCrud<ActivityData>();
const steps = fakeCrud<ActivityStepData>();
const benefits = fakeCrud<BenefitData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
    get benefitsApi() { return benefits; },
}));
vi.mock('@features/activities/api/steps.api', () => ({
    get stepsApi() { return steps; },
}));

const routes = [
    { path: '/activities/:id/edit', name: 'activities.edit', component: { template: '<div/>' } },
    { path: '/activities/:id', name: 'activities.page', component: { template: '<div/>' } },
];

async function setup(id = 'act-1') {
    const router = await createTestRouter({ routes, initialRoute: `/activities/${id}/edit` });
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
    benefits.items = [];
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
        // the deleted id leaves it with none, so removing an activity's last step while it is
        // still linked would take the activity with it.
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
        // Leaving the screen claiming a step the record no longer has would be worse than
        // reporting the failure and showing what is actually stored.
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
        // What is left behind is an unreferenced record — worth reporting, not worth putting
        // the step back for.
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
