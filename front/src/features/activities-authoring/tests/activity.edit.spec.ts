import { isFilterGroup, type Filter } from '@chapelure/core';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
import {
    buildAuthoredFilters,
    stateTransition,
} from '@features/activities-authoring/model/activity.edit';
import { describe, expect, it } from 'vitest';

/** The filters of the group, which is all this query ever builds — no nesting. */
function filtersOf(group: ReturnType<typeof buildAuthoredFilters>): Filter<ActivityData>[] {
    return group.filters.filter((f): f is Filter<ActivityData> => !isFilterGroup(f));
}

function valueOf(group: ReturnType<typeof buildAuthoredFilters>, key: keyof ActivityData) {
    return filtersOf(group).find(f => f.key === key)?.value;
}

describe('stateTransition', () => {
    it('offers to publish a draft', () => {
        const { to, label } = stateTransition(ActivityState.DRAFT);

        expect(to).toBe(ActivityState.VALIDATED);
        expect(label).toBe('activities.edit.publish');
    });

    it('offers to take a published activity back to draft', () => {
        const { to, label } = stateTransition(ActivityState.VALIDATED);

        expect(to).toBe(ActivityState.DRAFT);
        expect(label).toBe('activities.edit.unpublish');
    });

    it('offers the forward move for any state that is not validated', () => {
        // The button should stay publishable for a state the enum grows later, rather than
        // falling through to one that undoes something.
        const { to } = stateTransition('ARCHIVED' as ActivityData['state']);

        expect(to).toBe(ActivityState.VALIDATED);
    });
});

describe('buildAuthoredFilters', () => {
    it('scopes the list to the author, which is what the delete button is beside', () => {
        const group = buildAuthoredFilters('usr-1', null);

        expect(valueOf(group, 'user')).toBe('usr-1');
    });

    it('drops the state filter on the "all" tab, so it takes the same path as a chosen one', () => {
        const group = buildAuthoredFilters('usr-1', null);

        expect(filtersOf(group).map(f => f.key)).toEqual(['user']);
    });

    it('narrows to one state when a tab is picked', () => {
        const group = buildAuthoredFilters('usr-1', ActivityState.DRAFT);

        expect(valueOf(group, 'state')).toBe(ActivityState.DRAFT);
        expect(valueOf(group, 'user')).toBe('usr-1');
    });
});
