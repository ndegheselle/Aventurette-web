import { useLibraryFeed } from '@features/activities/composables/useLibraryFeed';
import type { ActivityData } from '@features/activities/models/activity';
import { emptyCatalogueFilters, type CatalogueFilters } from '@features/activities/models/catalogueFilters';
import { Deferred, type Paginated } from '@chapelure/core';
import { anActivity } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

// Changing the filters while a page is on its way: the page answers the old filters, so it must
// not land in the list the new ones start.

const pending: Deferred<Paginated<ActivityData>>[] = [];
const api = {
    page: vi.fn(() => {
        const answer = new Deferred<Paginated<ActivityData>>();
        pending.push(answer);
        return answer.promise;
    }),
};

vi.mock('@features/activities/api/activities.api', () => ({
    get catalogueApi() { return api; },
}));

const pageOf = (...items: ActivityData[]): Paginated<ActivityData> =>
    ({ items, total: 10, options: { page: 1, perPage: 12 } });

describe('useLibraryFeed', () => {
    it('drops a page asked for before the filters changed', async () => {
        const filters = ref<CatalogueFilters>(emptyCatalogueFilters());
        const feed = useLibraryFeed(filters, ref(''));

        void feed.loadMore();
        filters.value = { ...filters.value, ageMin: 3 };
        await nextTick();

        pending[1]!.resolve(pageOf(anActivity({ id: 'new' })));
        await flushPromises();
        pending[0]!.resolve(pageOf(anActivity({ id: 'old' })));
        await flushPromises();

        expect(feed.items.value.map(activity => activity.id)).toEqual(['new']);
        expect(feed.loading.value).toBe(false);
    });

    it('stops after a page fails, until the filters change', async () => {
        pending.length = 0;
        const filters = ref<CatalogueFilters>(emptyCatalogueFilters());
        const feed = useLibraryFeed(filters, ref(''));

        const load = feed.loadMore();
        pending[0]!.reject(new Error('refused'));
        await expect(load).rejects.toThrow('refused');
        expect(feed.done.value).toBe(true);

        filters.value = { ...filters.value, ageMin: 3 };
        await nextTick();
        expect(pending).toHaveLength(2);
    });
});
