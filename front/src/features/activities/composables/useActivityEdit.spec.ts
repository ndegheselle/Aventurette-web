import { aBenefit, anActivity, aStep, createTestRouter, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityData, ActivityStepData } from '@features/activities/model/activity';
import type { BenefitData } from '@features/activities/model/benefit';
import { useActivityEdit } from './useActivityEdit';

const activities = fakeCrud<ActivityData>();
const steps = fakeCrud<ActivityStepData>();
const benefits = fakeCrud<BenefitData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/activities/api/steps.api', () => ({
    get stepsApi() { return steps; },
}));
vi.mock('@features/activities/api/benefits.api', () => ({
    get benefitsApi() { return benefits; },
}));

const routes = [
    { path: '/activities/:id/edit', name: 'activities.edit', component: { template: '<div/>' } },
    { path: '/activities/:id', name: 'activities.page', component: { template: '<div/>' } },
];

async function setup(id: string) {
    const router = await createTestRouter({ routes, initialRoute: `/activities/${id}/edit` });
    const [subject] = withSetup(() => useActivityEdit(), router);
    await flushPromises();
    return { subject, router };
}

/** The activity under edit, as the backend now holds it. */
function stored(id: string): ActivityData | undefined {
    return activities.items.find(activity => activity.id === id);
}

beforeEach(() => {
    vi.restoreAllMocks();
    activities.items = [anActivity({ id: 'act-1', name: 'Treasure hunt' })];
    steps.items = [];
    benefits.items = [];
});

describe('useActivityEdit', () => {
    it('loads the activity named in the route', async () => {
        const { subject } = await setup('act-1');

        expect(subject.activity.value.name).toBe('Treasure hunt');
    });

    it('holds a blank activity for an id the backend does not know', async () => {
        // The form binds to the fields directly, so it needs something to bind to.
        const { subject } = await setup('missing');

        expect(subject.activity.value.steps).toEqual([]);
    });

    it('marks the benefits the activity already holds as selected', async () => {
        // TagSelect tells its selection apart by identity, and the records the activity was
        // loaded with are not the ones it is offering.
        const coordination = aBenefit({ name: 'Coordination' });
        benefits.items = [coordination, aBenefit({ name: 'Patience' })];
        activities.items = [anActivity({ id: 'act-benefits', benefits: [{ ...coordination }] })];

        const { subject } = await setup('act-benefits');

        expect(subject.selectedBenefits.value).toEqual([coordination]);
    });

    describe('saving the activity', () => {
        it('updates the activity it was opened on', async () => {
            const { subject } = await setup('act-1');
            subject.activity.value.name = 'Treasure hunt, revised';

            await subject.save();

            expect(activities.items).toHaveLength(1);
            expect(stored('act-1')?.name).toBe('Treasure hunt, revised');
        });

        it('lands on the activity it just saved', async () => {
            const { subject, router } = await setup('act-1');

            await subject.save();
            await flushPromises();

            expect(router.currentRoute.value.name).toBe('activities.page');
        });

        it('reports a rejected write as field errors and stays on the form', async () => {
            const { subject, router } = await setup('act-1');
            activities.failNextWith({ name: { code: 'validation_required' } });

            const saved = await subject.save();

            expect(saved).toBe(false);
            expect(subject.errors.get('name')).toBe('This field is required.');
            expect(router.currentRoute.value.name).toBe('activities.edit');
            expect(subject.isLoading.value).toBe(false);
        });
    });

    describe('steps', () => {
        it('writes a blank step and links it, so the modal opens on a record', async () => {
            const { subject } = await setup('act-1');

            const created = await subject.addStep();

            expect(created).not.toBeNull();
            expect(steps.items).toEqual([created]);
            expect(subject.activity.value.steps).toEqual([created]);
            expect(stored('act-1')?.steps).toEqual([created]);
        });

        it('gives the blank step what the collection requires of it', async () => {
            const { subject } = await setup('act-1');

            const created = await subject.addStep();

            expect(created?.description).toBeTruthy();
        });

        it('opens on nothing rather than an unlinked step when the link fails', async () => {
            const { subject } = await setup('act-1');

            activities.failNextWith({}, 'nope');
            const created = await subject.addStep();

            expect(created).toBeNull();
            expect(subject.activity.value.steps).toEqual([]);
        });

        it('takes in an edited step without writing anything, since the modal already has', async () => {
            const step = aStep({ description: '<p>Before.</p>' });
            activities.items = [anActivity({ id: 'act-steps', steps: [step] })];
            const { subject } = await setup('act-steps');
            const updates = vi.spyOn(activities, 'update');

            subject.replaceStep({ ...step, description: '<p>After.</p>' });

            expect(subject.activity.value.steps[0]?.description).toBe('<p>After.</p>');
            expect(updates).not.toHaveBeenCalled();
        });

        it('unlinks a removed step before deleting it', async () => {
            // `activities.steps` cascades on delete: deleting the last step an activity
            // points at would take the activity down with it.
            const step = aStep();
            steps.items = [step];
            activities.items = [anActivity({ id: 'act-steps', steps: [step] })];
            const { subject } = await setup('act-steps');

            const unlink = vi.spyOn(activities, 'update');
            const remove = vi.spyOn(steps, 'remove');
            await subject.detachStep(step);

            expect(unlink.mock.invocationCallOrder[0]!).toBeLessThan(remove.mock.invocationCallOrder[0]!);
            expect(stored('act-steps')?.steps).toEqual([]);
            expect(steps.items).toEqual([]);
        });

        it('keeps the step when the link cannot be written, and does not delete it', async () => {
            const step = aStep();
            steps.items = [step];
            activities.items = [anActivity({ id: 'act-steps', steps: [step] })];
            const { subject } = await setup('act-steps');

            activities.failNextWith({}, 'nope');
            await subject.detachStep(step);

            expect(subject.activity.value.steps).toEqual([step]);
            expect(steps.items).toEqual([step]);
        });
    });
});
