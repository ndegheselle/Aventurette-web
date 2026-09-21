import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { useModal } from '@chapelure/ui/modals/useModal';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
import { useAuth } from '@features/auth/composables/useAuth';
import ActivitiesEditPage from '@features/activities-authoring/pages/ActivitiesEdit.page.vue';
import { anActivity, aUser, fakeAuthProvider, fakeCrud, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The screen's wiring: a delete confirmed before it writes, and a tab that re-queries. What
// each of those decides is tested without a screen in `activity.edit.spec.ts`.

const activities = fakeCrud<ActivityData>();
const author = aUser();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => fakeAuthProvider(author) }));

const draft = anActivity({ name: 'Treasure hunt', state: ActivityState.DRAFT, user: author.id });
const published = anActivity({ name: 'Leaf hunt', state: ActivityState.PUBLISHED, user: author.id });

/** Stand in for the app-wide <ConfirmationModal />; without one, every prompt is declined. */
function answerConfirmationsWith(answer: boolean) {
    const controller = useModal();
    useConfirmation().registerModal(controller);
    vi.spyOn(controller, 'show').mockImplementation(async () => answer as any);
}

beforeEach(async () => {
    vi.restoreAllMocks();
    activities.items = [draft, published];
    activities.lastFilter = null;

    // `currentId()` throws when there is no session, and the fake provider starts signed out.
    await useAuth().login(author.email, 'password');
});

async function mountPage() {
    // The list reads the session, and useAuth reaches for the router to send a logout home.
    const { wrapper } = await mountWithRouter(ActivitiesEditPage);
    await flushPromises();
    return wrapper;
}

const rows = (wrapper: any) => wrapper.findAll('li.list-row');
const removeLink = (wrapper: any, index: number) => rows(wrapper)[index]!.find('a.text-error');
const tab = (wrapper: any, label: string) =>
    wrapper.findAll('[role="tab"]').find((t: any) => t.text() === label)!;

/** What the last query narrowed a field to, or undefined if it did not. */
function queriedValue(key: string) {
    return (activities.lastFilter?.filters as any[])?.find(f => f.key === key)?.value;
}

describe('ActivitiesEdit.page', () => {
    it('lists the activities with the state each one is in', async () => {
        const wrapper = await mountPage();

        expect(rows(wrapper)).toHaveLength(2);
        expect(rows(wrapper)[0]!.text()).toContain('Treasure hunt');
        expect(rows(wrapper)[0]!.text()).toContain('Draft');
        expect(rows(wrapper)[1]!.text()).toContain('Published');
    });

    it('narrows to drafts when the drafts tab is picked', async () => {
        const wrapper = await mountPage();

        await tab(wrapper, 'Drafts').trigger('click');
        await flushPromises();

        expect(queriedValue('state')).toBe(ActivityState.DRAFT);
    });

    it('deletes an activity once the deletion is confirmed', async () => {
        answerConfirmationsWith(true);
        const wrapper = await mountPage();

        await removeLink(wrapper, 0).trigger('click');
        await flushPromises();

        expect(activities.items.map(a => a.name)).toEqual(['Leaf hunt']);
    });

    it('deletes nothing when the confirmation is declined', async () => {
        answerConfirmationsWith(false);
        const wrapper = await mountPage();

        await removeLink(wrapper, 0).trigger('click');
        await flushPromises();

        expect(activities.items).toHaveLength(2);
    });
});
