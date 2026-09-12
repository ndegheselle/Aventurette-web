import { createTestRouter, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityData } from '@features/activities/model/activity';
import { useNewActivity } from './useNewActivity';

const activities = fakeCrud<ActivityData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/auth/composables/useAuth', () => ({
    useAuth: () => ({ currentId: () => 'usr-signed-in' }),
}));

const routes = [
    { path: '/activities', name: 'activities', component: { template: '<div/>' } },
    { path: '/activities/:id/edit', name: 'activities.edit', component: { template: '<div/>' } },
];

async function setup() {
    const router = await createTestRouter({ routes, initialRoute: '/activities' });
    const [subject] = withSetup(() => useNewActivity(), router);
    return { subject, router };
}

beforeEach(() => {
    activities.items = [];
});

describe('useNewActivity', () => {
    it('writes the activity before the editor opens, owned by the signed-in user', async () => {
        // Everything under an activity is a record of its own, and needs a parent to belong to.
        const { subject } = await setup();

        await subject.start();

        expect(activities.items).toHaveLength(1);
        expect(activities.items[0]?.user).toBe('usr-signed-in');
    });

    it('fills in what the collection requires, so a blank activity is still valid', async () => {
        const { subject } = await setup();

        await subject.start();

        const created = activities.items[0];
        expect(created?.name).toBe('New activity');
        expect(created?.description).toBeTruthy();
        expect(created?.environment).toBeTruthy();
        expect(created?.state).toBe('DRAFT');
    });

    it('opens the editor on what it created', async () => {
        const { subject, router } = await setup();

        await subject.start();
        await flushPromises();

        expect(router.currentRoute.value.name).toBe('activities.edit');
        expect(router.currentRoute.value.params.id).toBe(activities.items[0]?.id);
    });

    it('stays on the list when the activity cannot be created', async () => {
        const { subject, router } = await setup();
        activities.failNextWith({ name: { code: 'validation_required' } });

        const started = await subject.start();
        await flushPromises();

        expect(started).toBe(false);
        expect(router.currentRoute.value.name).toBe('activities');
        expect(subject.isLoading.value).toBe(false);
    });
});
