import { ActivitiesEnvironmentOptions, ActivitiesStateOptions, type ActivitiesResponse, type BenefitsResponse } from "@/backend/schema.g";
import type { Expanded } from "@chapelure/core";
import { formatRange, type Translate } from "@features/activities/model/criteria";
import {
    EMPTY_DESCRIPTION,
    STEP_RELATIONS,
    type ActivityMaterialData,
    type ActivityResourceData,
    type ActivityStepData,
} from "@features/activities/model/step";

// Relations arrive inlined — `activity.steps` holds the steps themselves. What is listed here
// has to match ACTIVITY_RELATIONS below; nothing checks that for us.
export type ActivityData = Expanded<ActivitiesResponse, {
    benefits: BenefitData[];
    steps: ActivityStepData[];
}>;

export type BenefitData = BenefitsResponse;

export const ActivityEnvironment = ActivitiesEnvironmentOptions;

export const ActivityState = ActivitiesStateOptions;

// Both an activity and a step seed their description with this. It is declared in `step.ts`
// because this file imports that one and not the other way round.
export { EMPTY_DESCRIPTION };

/** Relations to fetch alongside an activity for the detail and edit screens. */
export const ACTIVITY_RELATIONS = [
    "benefits",
    "steps", ...STEP_RELATIONS.map(relation => `steps.${relation}`),
];

/**
 * The environments offered in filters and the edit form, in display order.
 * `label` is a translation key — this is domain data, not translations, which is why it
 * does not live under locales/.
 */
export const availablesEnvironments = [
    { label: 'activities.environment.INDOOR', value: ActivityEnvironment.INDOOR },
    { label: 'activities.environment.OUTDOOR', value: ActivityEnvironment.OUTDOOR },
    { label: 'activities.environment.CLASSROOM', value: ActivityEnvironment.CLASSROOM },
    { label: 'activities.environment.CAR', value: ActivityEnvironment.CAR },
];

/**
 * A blank activity: what is written when the user starts one, and what the edit form binds to
 * until the real record arrives.
 *
 * `description`, `environment` and `state` are seeded because the collection requires them —
 * an activity is created before it is filled in, so it has to be valid while still empty, and
 * `DRAFT` is what an activity nobody has finished is. The `<select>` shows its first option
 * for an unmatched value anyway, which is the other reason not to leave the environment
 * undefined: it would save something other than what is on screen. `name` is left to the
 * caller, which is the one that can translate a placeholder.
 */
export function createEmptyActivity(): ActivityData {
    return {
        name: "",
        description: EMPTY_DESCRIPTION,
        environment: ActivityEnvironment.INDOOR,
        state: ActivityState.DRAFT,
        benefits: [] as BenefitData[],
        steps: [] as ActivityStepData[]
    } as ActivityData;
}

/** Render an age range, tolerating either bound being missing. */
export function formatAgeRange(t: Translate, ageMin?: number | null, ageMax?: number | null): string | null {
    return formatRange(t, 'activities.age', ageMin, ageMax);
}

/**
 * Every distinct material used across an activity's steps.
 *
 * Materials and resources hang off steps, not off the activity — the detail screen shows them
 * for the activity as a whole, so it has to gather them. Deduplicated by id, because two steps
 * needing the same rope should list it once, and kept in first-use order.
 */
export function materialsOf(activity: ActivityData | null | undefined): ActivityMaterialData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.materials ?? []));
}

/** Every distinct resource attached to an activity's steps. See `materialsOf`. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}

function distinctById<T extends { id: string }>(items: T[]): T[] {
    const byId = new Map<string, T>();
    for (const item of items)
        if (!byId.has(item.id)) byId.set(item.id, item);
    return [...byId.values()];
}
