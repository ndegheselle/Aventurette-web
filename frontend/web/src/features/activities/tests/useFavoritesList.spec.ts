import type { ActivityData } from '@features/activities/models/activity';
import { useFavoritesList } from '@features/activities/composables/useFavoritesList';
import { useAuth } from '@features/user/composables/useAuth';
import type { UserData } from '@features/user/models/user';
import { anActivity, aUser, fakeAuthProvider, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Favorites are read by id, and a filter with no id in it matches every activity.

const activities = fakeCrud<ActivityData>();
const provider = fakeAuthProvider<UserData>(aUser({ favorites: [] }));

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/user/api/session', () => ({ sessionProvider: () => provider }));

beforeEach(async () => {
    activities.items = [anActivity(), anActivity()];
    activities.lastFilter = null;
    await useAuth().login('parent@example.com', 'secret');
});

describe('useFavoritesList', () => {
    it('shows no activity, and asks for none, while the user has no favorite', async () => {
        const [subject] = withSetup(() => useFavoritesList());
        await flushPromises();

        expect(subject.items.value).toEqual([]);
        expect(activities.lastFilter).toBeNull();
    });
});
