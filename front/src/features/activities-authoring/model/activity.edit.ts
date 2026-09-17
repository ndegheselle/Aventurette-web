import {
    createFilter,
    createGroup,
    FilterOperator,
    removeEmptyFilters,
    type FilterGroup,
} from "@chapelure/core";
import { ActivityState, type ActivityData } from "@features/activities/model/activity";

/**
 * The activity seen from its author's side: which of them the list shows, and the one transition
 * the editor offers. Its shape stays in `activities/model` — this feature writes activities, it
 * does not redefine them.
 */

/** A state to narrow the authoring list to, or `null` for every one of them. */
export type ActivityStateFilter = ActivityData['state'] | null;

/** The tabs above the authoring list, in display order. `label` is a translation key. */
export const authoredStateTabs: { label: string, value: ActivityStateFilter }[] = [
    { label: 'activities.edit.states.all', value: null },
    { label: 'activities.edit.states.DRAFT', value: ActivityState.DRAFT },
    { label: 'activities.edit.states.PUBLISHED', value: ActivityState.PUBLISHED },
];

/** Where the state button sends an activity, and what to call the button. */
export interface StateTransition {
    to: ActivityData['state'];
    label: string;
}

/**
 * The move the state button makes, and the label for it — both together, so a button never reads
 * "Publish" over a click that writes `DRAFT`.
 *
 * Anything not already published offers the forward move, rather than matching `DRAFT` exactly:
 * a state the enum grows later should still be publishable.
 */
export function stateTransition(state: ActivityData['state']): StateTransition {
    return state === ActivityState.PUBLISHED
        ? { to: ActivityState.DRAFT, label: 'activities.edit.unpublish' }
        : { to: ActivityState.PUBLISHED, label: 'activities.edit.publish' };
}

/**
 * What the authoring list asks for, narrowed to one state when a tab other than "all" is picked.
 * `null` drops the filter entirely, so the "all" tab and a chosen one take the same path.
 *
 * Not scoped to the signed-in author: for now everybody may edit every activity.
 */
export function buildAuthoredFilters(state: ActivityStateFilter): FilterGroup<ActivityData> {
    return removeEmptyFilters(createGroup<ActivityData>({
        filters: [
            createFilter<ActivityData>({ key: 'state', value: state, operator: FilterOperator.Equals }),
        ],
    }));
}
