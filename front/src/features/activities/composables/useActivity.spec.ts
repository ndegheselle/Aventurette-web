import { anActivity, aMaterial, aResource, aStep, createTestRouter, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityData } from '@features/activities/model/activity';
import { useActivity } from './useActivity';

const activities = fakeCrud<ActivityData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));

const hunt = anActivity({ name: 'Treasure hunt' });
const race = anActivity({ name: 'Sack race' });

const routes = [{ path: '/activities/:id', name: 'activity', component: { template: '<div/>' } }];

async function setup(id: string) {
    const router = await createTestRouter({ routes, initialRoute: `/activities/${id}` });
    const [subject] = withSetup(() => useActivity(), router);
    await flushPromises();
    return { subject, router };
}

beforeEach(() => {
    activities.items = [hunt, race];
});

describe('useActivity', () => {
    it('loads the activity named in the route', async () => {
        const { subject } = await setup(hunt.id);

        expect(subject.activity.value).toEqual(hunt);
    });

    it('reloads when the route moves to another activity', async () => {
        // vue-router reuses the component when only the parameter changes, so watching the
        // param is what keeps the previous activity from staying on screen.
        const { subject, router } = await setup(hunt.id);

        await router.push(`/activities/${race.id}`);
        await flushPromises();

        expect(subject.activity.value).toEqual(race);
    });

    it('holds null for an id the backend does not know', async () => {
        const { subject } = await setup('missing');

        expect(subject.activity.value).toBeNull();
    });

    it('gathers the materials its steps need', async () => {
        const rope = aMaterial({ name: 'Rope' });
        activities.items = [anActivity({ id: 'act-mats', steps: [aStep({ materials: [rope] })] })];

        const { subject } = await setup('act-mats');

        expect(subject.materials.value).toEqual([rope]);
    });

    it('gathers the resources attached to its steps', async () => {
        const sheet = aResource({ name: 'Rules' });
        activities.items = [anActivity({ id: 'act-res', steps: [aStep({ resources: [sheet] })] })];

        const { subject } = await setup('act-res');

        expect(subject.resources.value).toEqual([sheet]);
    });

    it('has nothing to show before anything is loaded', async () => {
        const { subject } = await setup('missing');

        expect(subject.materials.value).toEqual([]);
        expect(subject.resources.value).toEqual([]);
    });
});
