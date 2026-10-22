import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useAuth } from '@features/user/composables/useAuth';
import { useFavorites } from '@features/user/composables/useFavorites';
import type { UserData } from '@features/user/models/user';
import { aUser, fakeAuthProvider, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Each change sends the whole list, then reads the session again. Changes made in a row have to
// wait for each other, or the second sends a list missing the first.

const users = fakeCrud<UserData>();
const provider = {
    ...fakeAuthProvider<UserData>(aUser()),
    // The session is the user record as the backend now holds it.
    refresh: async () => users.items[0] ?? null,
};

vi.mock('@features/user/api/profile.api', () => ({
    get profileApi() { return users; },
}));
vi.mock('@features/user/api/session', () => ({ sessionProvider: () => provider }));

async function setup() {
    const [subject] = withSetup(() => useFavorites());
    await useAuth().refresh();
    return subject;
}

beforeEach(() => {
    users.items = [aUser({ id: 'usr-1', favorites: [] })];
    useAlert().alerts.value = [];
});

describe('useFavorites', () => {
    it('keeps both favorites when two are added in a row', async () => {
        const subject = await setup();

        await Promise.all([subject.toggle('act-1'), subject.toggle('act-2')]);

        expect(users.items[0]!.favorites).toEqual(['act-1', 'act-2']);
        expect(subject.favoriteIds.value).toEqual(['act-1', 'act-2']);
    });

    it('puts a removed favorite back when its toast is cancelled', async () => {
        users.items = [aUser({ id: 'usr-1', favorites: ['act-1'] })];
        const subject = await setup();

        await subject.toggle('act-1');
        expect(subject.isFavorite('act-1')).toBe(false);

        const { alerts, act } = useAlert();
        act(alerts.value[0]!);
        await flushPromises();

        expect(subject.isFavorite('act-1')).toBe(true);
    });
});
