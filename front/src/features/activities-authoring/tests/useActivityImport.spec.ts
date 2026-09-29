import { useActivityImport } from '@features/activities-authoring/composables/useActivityImport';
import type { ActivityData } from '@features/activities/model/activity';
import type { ActivityMaterialData } from '@features/activities/model/material';
import type { ActivityStepData } from '@features/activities/model/step';
import type { ActivityWorkshopData } from '@features/activities/model/workshop';
import { useAuth } from '@features/auth/composables/useAuth';
import { aMaterial, aPickedFile, aUser, createTestRouter, fakeAuthProvider, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// An import is several records written one after the other, and it lands whole or not at all:
// the activity first, the links last, and a failure in between deletes the activity.

const activities = fakeCrud<ActivityData>();
const steps = fakeCrud<ActivityStepData>();
const workshops = fakeCrud<ActivityWorkshopData>();
const materials = {
    create: vi.fn(async (name: string, activity: string, quantity: string = '') =>
        aMaterial({ name, activity, quantity }) as ActivityMaterialData),
};
const visuals = { upload: vi.fn(async (_activity: string, _file: File) => ({}) as ActivityData) };
const author = aUser();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/activities-authoring/api/steps.api', () => ({
    get stepsApi() { return steps; },
}));
vi.mock('@features/activities-authoring/api/workshops.api', () => ({
    get workshopsApi() { return workshops; },
}));
vi.mock('@features/activities-authoring/api/materials.api', () => ({
    get materialsApi() { return materials; },
}));
vi.mock('@features/activities-authoring/api/visuals.api', () => ({
    get visualsApi() { return visuals; },
}));
vi.mock('@features/activities-authoring/api/tags.api', () => ({
    tagsApi: { getAll: async () => [] },
}));
vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => fakeAuthProvider(author) }));

const routes = [
    { path: '/activities/authoring', name: 'activities.authoring', component: { template: '<div/>' } },
    { path: '/activities/authoring/:id', name: 'activities.authoring.page', component: { template: '<div/>' } },
];

const SHEET = {
    version: 1,
    name: 'Bug hunt',
    materials: [{ name: 'Loupe', quantity: '1 par enfant' }],
    steps: [
        { kind: 'PREPARE', title: 'Hide the bugs', materials: ['Loupe'] },
        { kind: 'CONCLUSION', title: 'Count them' },
    ],
    workshops: [{ name: 'Leaves', materials: ['loupe'] }],
};

function aSheetFile(json: object = SHEET): File {
    return new File([JSON.stringify(json)], 'bug-hunt.json', { type: 'application/json' });
}

async function setup() {
    const router = await createTestRouter({ routes, initialRoute: '/activities/authoring' });
    const [subject] = withSetup(() => useActivityImport(), router);
    await subject.start();
    await subject.readSheet([aSheetFile()]);
    return { subject, router };
}

beforeEach(async () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    activities.items = [];
    steps.items = [];
    workshops.items = [];

    await useAuth().login(author.email, 'password');
});

describe('importSheet', () => {
    it('writes the activity, then what hangs off it, then links them, and opens the editor', async () => {
        const { subject, router } = await setup();
        const link = vi.spyOn(activities, 'update');

        expect(await subject.importSheet()).toBe(true);
        await flushPromises();

        const [activity] = activities.items;
        expect(activity?.name).toBe('Bug hunt');
        expect(activity?.user).toBe(author.id);
        expect(materials.create).toHaveBeenCalledWith('Loupe', activity!.id, '1 par enfant');
        expect(steps.items.map(step => step.title)).toEqual(['Hide the bugs', 'Count them']);
        expect(steps.items[0]!.materials.map(material => material.name)).toEqual(['Loupe']);
        expect(workshops.items[0]!.materials.map(material => material.name)).toEqual(['Loupe']);

        // The links are the last write, once every record they point at exists.
        expect(link).toHaveBeenCalledTimes(1);
        expect(activity?.steps).toEqual(steps.items);
        expect(activity?.workshops).toEqual(workshops.items);

        expect(router.currentRoute.value.name).toBe('activities.authoring.page');
        expect(router.currentRoute.value.params.id).toBe(activity!.id);
    });

    it('uploads the visual only when one was picked', async () => {
        const { subject } = await setup();

        await subject.importSheet();
        expect(visuals.upload).not.toHaveBeenCalled();

        const cover = aPickedFile();
        subject.pickVisual([cover]);
        await subject.importSheet();
        expect(visuals.upload).toHaveBeenCalledWith(activities.items[1]!.id, cover);
    });

    it('deletes the activity when a write under it fails, and stays on the list', async () => {
        // Better no activity than half of one: the cascades take the steps already written.
        const { subject, router } = await setup();
        const destroy = vi.spyOn(activities, 'remove');
        const link = vi.spyOn(activities, 'update');
        vi.spyOn(steps, 'create').mockRejectedValueOnce(new Error('nope'));

        expect(await subject.importSheet()).toBe(false);

        expect(destroy).toHaveBeenCalledTimes(1);
        expect(activities.items).toEqual([]);
        expect(link).not.toHaveBeenCalled();
        expect(router.currentRoute.value.name).toBe('activities.authoring');
    });

    it('writes nothing for a sheet that could not be read', async () => {
        const { subject } = await setup();
        await subject.readSheet([aSheetFile({ name: '' })]);

        expect(subject.sheet.value).toBeNull();
        await subject.importSheet();

        expect(activities.items).toEqual([]);
    });
});
