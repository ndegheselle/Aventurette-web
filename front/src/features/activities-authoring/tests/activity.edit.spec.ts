import { isFilterGroup, type Filter } from '@chapelure/core';
import {
    buildAuthoredFilters,
    stateTransition,
} from '@features/activities-authoring/model/activity.edit';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
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

        expect(to).toBe(ActivityState.PUBLISHED);
        expect(label).toBe('activities.authoring.publish');
    });

    it('offers to take a published activity back to draft', () => {
        const { to, label } = stateTransition(ActivityState.PUBLISHED);

        expect(to).toBe(ActivityState.DRAFT);
        expect(label).toBe('activities.authoring.unpublish');
    });

    it('offers the forward move for any state that is not published', () => {
        // The button should stay publishable for a state the enum grows later, rather than
        // falling through to one that undoes something.
        const { to } = stateTransition('ARCHIVED' as ActivityData['state']);

        expect(to).toBe(ActivityState.PUBLISHED);
    });
});

describe('buildAuthoredFilters', () => {
    it('drops the state filter on the "all" tab, so it takes the same path as a chosen one', () => {
        const group = buildAuthoredFilters(null);

        expect(filtersOf(group)).toEqual([]);
    });

    it('narrows to one state when a tab is picked', () => {
        const group = buildAuthoredFilters(ActivityState.DRAFT);

        expect(valueOf(group, 'state')).toBe(ActivityState.DRAFT);
    });
});
