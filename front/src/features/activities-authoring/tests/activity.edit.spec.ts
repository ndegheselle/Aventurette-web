import { isFilterGroup, type Filter } from '@chapelure/core';
import {
    buildAuthoredFilters,
    stateTransition,
    columnOf,
    pickedAmong,
    rangeEndOf,
    replaceTagsOfType,
} from '@features/activities-authoring/model/activity.edit';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
import { ActivityTagType } from '@features/activities/model/tag';
import { aTag } from '@tests';
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

describe('pickedAmong', () => {
    it('hands back the options themselves, since the picker tells a picked item by reference', () => {
        const art = aTag({ id: 'tag1' });
        const forest = aTag({ id: 'tag2' });
        const options = [art, forest];

        // The activity holds its own copy of the row, from another read.
        const picked = pickedAmong(options, [{ ...forest }]);

        expect(picked).toHaveLength(1);
        expect(picked[0]).toBe(options[1]);
    });
});

describe('replaceTagsOfType', () => {
    it("replaces one kind's tags and leaves the other kinds' alone", () => {
        const domain = aTag({ type: ActivityTagType.FIELD });
        const safety = aTag({ type: ActivityTagType.SECURITY });
        const newSafety = aTag({ type: ActivityTagType.SECURITY });

        expect(replaceTagsOfType([domain, safety], ActivityTagType.SECURITY, [newSafety]))
            .toEqual([domain, newSafety]);
    });

    it('empties a kind when its picker is cleared', () => {
        const safety = aTag({ type: ActivityTagType.SECURITY });

        expect(replaceTagsOfType([safety], ActivityTagType.SECURITY, [])).toEqual([]);
    });
});

describe('rangeEndOf', () => {
    it('reads a stored 0 as unset, which is what PocketBase stores for an empty number', () => {
        // Otherwise a new activity's age_max of 0 would pin the upper thumb to the floor.
        expect(rangeEndOf(0)).toBeNull();
        expect(rangeEndOf(undefined)).toBeNull();
        expect(rangeEndOf(6)).toBe(6);
    });

    it('stores an unset end as 0, and a set one as it is', () => {
        expect(columnOf(null)).toBe(0);
        expect(columnOf(6)).toBe(6);
    });
});
