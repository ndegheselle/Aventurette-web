import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { useModal } from '@chapelure/ui/modals/useModal';
import { aChild, aUser, fakeAuthProvider, fakeCrud, mountWithRouter } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChildrenData } from '@features/users/model/child';
import ChildrenList from '@features/users/components/children/ChildrenList.vue';

const children = fakeCrud<ChildrenData>();

vi.mock('@features/users/api/children.api', () => ({
    get childrenApi() { return children; },
}));
vi.mock('@features/auth/api/session', () => ({ sessionProvider: () => fakeAuthProvider(aUser()) }));
// Reached through the edit modal's interests picker, which this list renders.
vi.mock('@features/users/api/interests.api', () => ({ interestsApi: fakeCrud([]) }));

const camille = aChild({ name: 'Camille' });
const remy = aChild({ name: 'Rémy' });

/**
 * Stand in for the app-wide <ConfirmationModal />, answering every prompt the same way.
 * Without one registered, useConfirmation declines by default.
 */
function answerConfirmationsWith(answer: boolean) {
    const controller = useModal();
    useConfirmation().registerModal(controller);
    const show = vi.spyOn(controller, 'show')
        .mockImplementation(async () => answer as any);
    return show;
}

beforeEach(() => {
    children.items = [camille, remy];
});

async function mountList() {
    // The list reads the session, and useAuth reaches for the router to send a logout home.
    const { wrapper } = await mountWithRouter(ChildrenList);
    await flushPromises();
    return wrapper;
}

const rows = (wrapper: any) => wrapper.findAll('li.list-row');
const removeButton = (wrapper: any, index: number) => rows(wrapper)[index]!.findAll('button')[0]!;

describe('ChildrenList', () => {
    it('lists the children already recorded', async () => {
        const wrapper = await mountList();

        expect(rows(wrapper).map((r: any) => r.text())).toEqual([
            expect.stringContaining('Camille'),
            expect.stringContaining('Rémy'),
        ]);
    });

    it('says so when there are none', async () => {
        children.items = [];

        expect((await mountList()).text()).toContain('No data');
    });

    it('asks before removing a child', async () => {
        const show = answerConfirmationsWith(false);
        const wrapper = await mountList();

        await removeButton(wrapper, 0).trigger('click');
        await flushPromises();

        expect(show).toHaveBeenCalledOnce();
    });

    it('keeps the child, on screen and on the server, when the prompt is declined', async () => {
        answerConfirmationsWith(false);
        const wrapper = await mountList();

        await removeButton(wrapper, 0).trigger('click');
        await flushPromises();

        expect(rows(wrapper)).toHaveLength(2);
        expect(children.items).toHaveLength(2);
    });

    it('deletes the child on the server once the prompt is accepted', async () => {
        answerConfirmationsWith(true);
        const wrapper = await mountList();

        await removeButton(wrapper, 0).trigger('click');
        await flushPromises();

        expect(children.items.map(c => c.name)).toEqual(['Rémy']);
    });

    it('takes the deleted child off the list', async () => {
        answerConfirmationsWith(true);
        const wrapper = await mountList();

        await removeButton(wrapper, 0).trigger('click');
        await flushPromises();

        expect(rows(wrapper).map((r: any) => r.text())).toEqual([expect.stringContaining('Rémy')]);
    });
});
