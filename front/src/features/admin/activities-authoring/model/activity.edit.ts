import {
    createFilter,
    createGroup,
    FilterOperator,
    removeEmptyFilters,
    type FilterGroup,
} from "@chapelure/core";
import { ActivityState, emptyDevelopment, type ActivityData } from "@features/activities/model/activity";

/**
 * The activity seen from its author's side: the blank one written on add, what the form binds
 * through, which activities the list shows, and the one transition the editor offers.
 */

// ── The blank activity ──────────────────────────────────────────────────────────────────────

/**
 * A blank activity: written when the user starts one, and bound to the edit form until the real
 * record arrives. Every family is there, empty, so the form can bind into any of them.
 */
export function createEmptyActivity(): ActivityData {
    // Typed as what the author fills in, so every family is checked; the record fills in the rest.
    const blank: Omit<ActivityData, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName' | 'user' | 'visual'> = {
        name: "",
        description: "",
        state: ActivityState.DRAFT,
        visualBrief: "",
        classification: { format: "", practices: [], themes: [] },
        imaginary: { rule: "", universes: [] },
        audience: {
            ageMin: 0,
            ageMax: 0,
            participantsMin: 0,
            participantsMax: 0,
            childrenPace: "",
            ageVariants: "",
        },
        supervision: { hostEffort: "", hostsRequired: 0, crossSupervision: false, notes: "" },
        place: { indoor: false, outdoor: false, locations: [], conditions: "", seasons: [] },
        safety: { tags: [] },
        pedagogy: {
            goals: [],
            idealFor: [],
            development: emptyDevelopment(),
        },
        steps: [],
        materials: [],
        workshops: [],
    };

    return blank as ActivityData;
}

// ── The form ────────────────────────────────────────────────────────────────────────────────

/** How far the age slider goes. An end left at its edge is unset: no limit on that side. */
export const AGE_BOUNDS = { floor: 0, ceiling: 18 };

/** How far the participants slider goes. */
export const PARTICIPANTS_BOUNDS = { floor: 1, ceiling: 30 };

// ── The authoring list ──────────────────────────────────────────────────────────────────────

/** A state to narrow the authoring list to, or `null` for every one of them. */
export type ActivityStateFilter = ActivityData['state'] | null;

/** The tabs above the authoring list, in display order. `label` is a translation key. */
export const authoredStateTabs: { label: string, value: ActivityStateFilter }[] = [
    { label: 'activities.authoring.states.all', value: null },
    { label: 'activities.authoring.states.DRAFT', value: ActivityState.DRAFT },
    { label: 'activities.authoring.states.PUBLISHED', value: ActivityState.PUBLISHED },
];

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

// ── The state button ────────────────────────────────────────────────────────────────────────

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
