import {
    createFilter,
    createGroup,
    FilterOperator,
    removeEmptyFilters,
    type FilterGroup,
} from "@chapelure/core";
import { ActivitiesEnvironnement, ActivityState, type ActivityData } from "@features/activities/model/activity";
import type { ActivityStepData } from "@features/activities/model/step";
import type { ActivityTagData } from "@features/activities/model/tag";

/**
 * The activity seen from its author's side: which of them the list shows, and the one transition
 * the editor offers. Its shape stays in `activities/model` — this feature writes activities, it
 * does not redefine them.
 */

/**
 * A blank activity: written when the user starts one, and bound to the edit form until the real
 * record arrives.
 *
 * `description` and `state` are seeded because the collection requires them, and an activity is
 * created before it is filled in. `name` is the caller's — only it can translate a placeholder.
 */
export function createEmptyActivity(): ActivityData {
    return {
        age_max: 0,
        age_min: 0,
        participants_max: 0,
        participants_min: 0,
        environnement: ActivitiesEnvironnement.OUTDOOR,
        name: "",
        description: "",
        state: ActivityState.DRAFT,
        steps: [] as ActivityStepData[],
        tags: [] as ActivityTagData[],
    } as ActivityData;
}

/**
 * The options the activity already carries — as the options themselves, not as the activity's
 * copies. `TagSelect` tells a picked item by reference, and the activity and the options are two
 * reads of the same rows, so matching by id has to happen here.
 */
export function pickedAmong<T extends ActivityTagData>(options: T[], selected: ActivityTagData[]): T[] {
    const ids = new Set(selected.map(tag => tag.id));
    return options.filter(option => ids.has(option.id));
}

/**
 * The activity's tags with one kind's replaced by what its picker now holds. Each kind has a
 * picker of its own, so a pick in one must leave the others' tags where they are.
 */
export function replaceTagsOfType(
    selected: ActivityTagData[],
    type: ActivityTagData['type'],
    picked: ActivityTagData[],
): ActivityTagData[] {
    return [...selected.filter(tag => tag.type !== type), ...picked];
}

/** A range end as the slider binds it: `null` is unset, no limit on that side. */
export type RangeEnd = number | null;

/** How far the age slider goes. An end left at its edge is unset: no limit on that side. */
export const AGE_BOUNDS = { floor: 0, ceiling: 18 };

/** How far the participants slider goes. */
export const PARTICIPANTS_BOUNDS = { floor: 1, ceiling: 30 };

/**
 * A stored bound as the slider reads it. PocketBase stores an empty number as 0, and no range
 * here means anything by a 0 — so 0 is unset, and a new activity's `age_max: 0` does not pin
 * the upper thumb to the floor.
 */
export function rangeEndOf(value: number | null | undefined): RangeEnd {
    return value ? value : null;
}

/** And back: an unset end is stored as the 0 PocketBase would store anyway. */
export function columnOf(value: RangeEnd | undefined): number {
    return value ?? 0;
}

/** What a range reads as beside its label. `key` is a translation key, `params` its values. */
export interface RangeLabel {
    key: string;
    params: { min?: number; max?: number };
}

export function rangeLabel(min: RangeEnd, max: RangeEnd): RangeLabel {
    if (min === null && max === null) return { key: 'activities.authoring.range.any', params: {} };
    if (max === null) return { key: 'activities.authoring.range.from', params: { min: min! } };
    if (min === null) return { key: 'activities.authoring.range.upTo', params: { max } };
    if (min === max) return { key: 'activities.authoring.range.exactly', params: { min } };

    return { key: 'activities.authoring.range.between', params: { min, max } };
}

/** A state to narrow the authoring list to, or `null` for every one of them. */
export type ActivityStateFilter = ActivityData['state'] | null;

/** The tabs above the authoring list, in display order. `label` is a translation key. */
export const authoredStateTabs: { label: string, value: ActivityStateFilter }[] = [
    { label: 'activities.authoring.states.all', value: null },
    { label: 'activities.authoring.states.DRAFT', value: ActivityState.DRAFT },
    { label: 'activities.authoring.states.PUBLISHED', value: ActivityState.PUBLISHED },
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
        ? { to: ActivityState.DRAFT, label: 'activities.authoring.unpublish' }
        : { to: ActivityState.PUBLISHED, label: 'activities.authoring.publish' };
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
