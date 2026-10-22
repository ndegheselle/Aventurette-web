import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useFavorites } from '@features/activities/composables/useFavorites';
import type { ActivityData } from '@features/activities/models/activity';
import { useAuth } from '@features/user/composables/useAuth';
import type { SessionUser } from '@features/user/models/user';
import { anActivity, aUser, fakeAuthProvider, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// A removal can be taken back from its toast, which has to write the favorite again, not only
// show it again.

const hunt = anActivity({ id: 'act-1', name: 'Treasure hunt' });
const stored = { ids: [] as string[] };

const api = {
    of: async () => [hunt].filter(activity => stored.ids.includes(activity.id)),
    add: async (_userId: string, activityId: string) => { stored.ids.push(activityId); },
    remove: async (_userId: string, activityId: string) => {
        stored.ids = stored.ids.filter(id => id !== activityId);
    },
};

vi.mock('@features/activities/api/favorites.api', () => ({
    get favoritesApi() { return api; },
}));
vi.mock('@features/user/api/session', () => ({
    sessionProvider: () => fakeAuthProvider<SessionUser>(aUser({ id: 'usr-1' })),
}));

async function setup() {
    await useAuth().login('parent@example.com', 'secret');
    const [subject] = withSetup(() => useFavorites());
    await flushPromises();
    return subject;
}

beforeEach(() => {
    stored.ids = ['act-1'];
    useAlert().alerts.value = [];
});

describe('useFavorites', () => {
    it('writes a removed favorite back when its toast is cancelled', async () => {
        const subject = await setup();
        expect(subject.favorites.value.map((a: ActivityData) => a.id)).toEqual(['act-1']);

        await subject.toggle(hunt);
        expect(stored.ids).toEqual([]);
        expect(subject.isFavorite('act-1')).toBe(false);

        const { alerts, act } = useAlert();
        act(alerts.value[0]!);
        await flushPromises();

        expect(stored.ids).toEqual(['act-1']);
        expect(subject.isFavorite('act-1')).toBe(true);
    });
});
