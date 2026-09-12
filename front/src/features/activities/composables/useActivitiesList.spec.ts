import { createGroup, PaginationOptions } from '@chapelure/core';
import { anActivity, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityData } from '@features/activities/model/activity';
import { useActivitiesList } from './useActivitiesList';

const activities = fakeCrud<ActivityData>();

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));

beforeEach(() => {
    activities.items = Array.from({ length: 12 }, (_, i) => anActivity({ name: `Activity ${i}` }));
    activities.lastFilter = null;
});

describe('useActivitiesList', () => {
    it('loads the first page on mount', async () => {
        const [list] = withSetup(() => useActivitiesList());

        await flushPromises();

        expect(list.paginated.value.items).toHaveLength(5);
        expect(list.paginated.value.total).toBe(12);
    });

    it('starts with no criteria, so the first load is the whole list', async () => {
        const [list] = withSetup(() => useActivitiesList());

        await flushPromises();

        expect(activities.lastFilter?.filters).toEqual([]);
        expect(list.filters.value.filters).toEqual([]);
    });

    it('takes the page size it is given', async () => {
        const [list] = withSetup(() => useActivitiesList(10));

        await flushPromises();

        expect(list.paginated.value.items).toHaveLength(10);
    });

    it('sends the criteria it is handed on the next refresh', async () => {
        const [list] = withSetup(() => useActivitiesList());
        await flushPromises();

        list.filters.value = createGroup<ActivityData>({
            filters: [{ key: 'name', value: 'hunt', operator: 'contains', combine: 'and' }],
        });
        await list.refresh();

        expect(activities.lastFilter?.filters).toHaveLength(1);
    });

    it('keeps the current page when re-querying, so paging does not reset itself', async () => {
        const [list] = withSetup(() => useActivitiesList());
        await flushPromises();

        list.paginated.value.options = new PaginationOptions(3, 5);
        await list.refresh();

        expect(activities.lastFilter).not.toBeNull();
        expect(list.paginated.value.options.page).toBe(3);
        expect(list.paginated.value.items).toHaveLength(2);
    });

    it('reports an empty result rather than leaving the previous page on screen', async () => {
        const [list] = withSetup(() => useActivitiesList());
        await flushPromises();

        activities.items = [];
        await list.refresh();

        expect(list.paginated.value.items).toEqual([]);
        expect(list.paginated.value.total).toBe(0);
    });
});
