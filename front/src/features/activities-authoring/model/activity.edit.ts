import {
    createFilter,
    createGroup,
    FilterOperator,
    removeEmptyFilters,
    type FilterGroup,
} from "@chapelure/core";
import { ActivityState, type ActivityData } from "@features/activities/model/activity";

/**
 * The activity seen from its author's side: which of them the list shows, and the one
 * transition the editor offers.
 *
 * Both are decisions over plain data, so neither sits in the screen that renders it. The
 * activity's own shape stays in `activities/model` — this feature writes activities, it does
 * not redefine them.
 */

/** A state to narrow the authoring list to, or `null` for every one of them. */
export type ActivityStateFilter = ActivityData['state'] | null;

/**
 * The tabs above the authoring list, in display order.
 *
 * `label` is a translation key: these are the states the domain has, not the words shown for
 * them — the same arrangement as `availablesEnvironments`, and the reason this is not under
 * `locales/`.
 */
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
 * The move the state button makes, and the label that describes it.
 *
 * There are two states, so the button is not a choice between them but the other end of a
 * toggle. Both halves are returned together because a label that says "Publish" over a click
 * that writes `DRAFT` is the failure worth designing out.
 *
 * Anything that is not already validated offers the forward move, rather than matching `DRAFT`
 * exactly — a state the enum grows later should still be publishable instead of falling
 * through to a button that undoes something.
 */
export function stateTransition(state: ActivityData['state']): StateTransition {
    return state === ActivityState.PUBLISHED
        ? { to: ActivityState.DRAFT, label: 'activities.edit.unpublish' }
        : { to: ActivityState.PUBLISHED, label: 'activities.edit.publish' };
}

/**
 * What the authoring list asks for: the signed-in author's activities, narrowed to one state
 * when a tab other than "all" is picked.
 *
 * The author scope is not a filter the screen offers — it is what makes this list *theirs*,
 * and what keeps its delete button off somebody else's activity. It is built here rather than
 * in the composable for the same reason `buildActivityFilters` is: a query that can be read
 * without a screen in front of it.
 *
 * `null` for the state drops the filter entirely — `removeEmptyFilters` strips it — so the
 * "all" tab and a chosen one take the same path.
 */
export function buildAuthoredFilters(state: ActivityStateFilter): FilterGroup<ActivityData> {
    return removeEmptyFilters(createGroup<ActivityData>({
        filters: [
            createFilter<ActivityData>({ key: 'state', value: state, operator: FilterOperator.Equals }),
        ],
    }));
}
