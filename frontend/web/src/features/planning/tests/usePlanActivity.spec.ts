import type { ActivityData } from '@features/activities/models/activity';
import { usePlanActivity } from '@features/planning/composables/usePlanActivity';
import type { PlannedActivityData } from '@features/planning/models/planning';
import { useAuth } from '@features/user/composables/useAuth';
import type { SessionUser } from '@features/user/models/user';
import { anActivity, aUser, fakeAuthProvider, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The sheet searches as the user types, and the backend aborts the older search: an answer that
// comes back late must not replace the one for what the field now holds.

const hunt = anActivity({ id: 'act-1', name: 'Treasure hunt' });
const mime = anActivity({ id: 'act-2', name: 'Mime' });

/** Each search waits until the test answers it, so the order of answers is the test's to pick. */
const searches: { text: string; answer: (found: ActivityData[]) => void }[] = [];
const created: PlannedActivityData[] = [];

const api = {
    activitiesNamed: (text: string) => new Promise<ActivityData[]>(answer => searches.push({ text, answer })),
    create: async (plan: PlannedActivityData) => {
        created.push(plan);
        return plan;
    },
};

vi.mock('@features/planning/api/planning.api', () => ({
    get planningApi() { return api; },
}));
vi.mock('@features/user/api/session', () => ({
    sessionProvider: () => fakeAuthProvider<SessionUser>(aUser({ id: 'usr-1' })),
}));

async function setup() {
    await useAuth().login('parent@example.com', 'secret');
    const [subject] = withSetup(() => usePlanActivity());
    return subject;
}

beforeEach(() => {
    searches.length = 0;
    created.length = 0;
});

describe('usePlanActivity', () => {
    it('plans the chosen activity at the time picked', async () => {
        const subject = await setup();

        const planned = subject.plan();
        subject.choose(hunt);
        subject.start.value = '2026-11-02T10:30';
        subject.picker.confirm(true);

        expect(await planned).toBe(true);
        expect(created).toEqual([
            expect.objectContaining({ user: 'usr-1', activity: hunt, start: new Date(2026, 10, 2, 10, 30) }),
        ]);
    });

    it('keeps the latest search when an earlier one answers after it', async () => {
        const subject = await setup();

        void subject.find('m');
        void subject.find('mi');
        searches[1]!.answer([mime]);
        await flushPromises();
        searches[0]!.answer([hunt, mime]);
        await flushPromises();

        expect(subject.found.value).toEqual([mime]);
    });
});
