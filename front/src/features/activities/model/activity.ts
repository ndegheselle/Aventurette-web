import { ActivitiesEnvironmentOptions, ActivitiesStateOptions, type ActivitiesResponse, type BenefitsResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import {
    EMPTY_DESCRIPTION,
    type ActivityMaterialData,
    type ActivityResourceData,
    type ActivityStepData,
} from "@features/activities/model/step";

export type BenefitData = Entity<BenefitsResponse>;

/** An activity as the app uses it: `activity.steps` is the steps, not their ids. */
export type ActivityData = Entity<ActivitiesResponse, {
    benefits: BenefitData[];
    steps: ActivityStepData[];
}>;

export const ActivityEnvironment = ActivitiesEnvironmentOptions;

export const ActivityState = ActivitiesStateOptions;

// Declared in `step.ts`, re-exported here: an activity seeds its description with it too.
export { EMPTY_DESCRIPTION };

/** The environments offered in filters and the edit form, in display order. */
export const availablesEnvironments = [
    { label: 'activities.environment.INDOOR', value: ActivityEnvironment.INDOOR },
    { label: 'activities.environment.OUTDOOR', value: ActivityEnvironment.OUTDOOR },
    { label: 'activities.environment.CLASSROOM', value: ActivityEnvironment.CLASSROOM },
    { label: 'activities.environment.CAR', value: ActivityEnvironment.CAR },
];

/**
 * A blank activity: written when the user starts one, and bound to the edit form until the real
 * record arrives.
 *
 * `description`, `environment` and `state` are seeded because the collection requires them, and
 * an activity is created before it is filled in. `name` is the caller's — only it can translate
 * a placeholder.
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

/** A translation lookup. Structural, so `model/` stays free of framework types. */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

/**
 * Render an age range, tolerating either bound being missing. What the detail screen reads;
 * a filter chip gets its own from the criterion.
 */
export function formatAgeRange(t: Translate, ageMin?: number | null, ageMax?: number | null): string | null {
    if (ageMin && ageMax) {
        return t('activities.age.range', { min: ageMin, max: ageMax });
    } else if (ageMin) {
        return t('activities.age.minOnly', { min: ageMin });
    } else if (ageMax) {
        return t('activities.age.maxOnly', { max: ageMax });
    }

    return null;
}

/**
 * Every material used across an activity's steps — they hang off steps, not off the activity.
 * Deduplicated by id, in first-use order.
 */
export function materialsOf(activity: ActivityData | null | undefined): ActivityMaterialData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.materials ?? []));
}

/** Every resource attached to an activity's steps. See `materialsOf`. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}

function distinctById<T extends { id: string }>(items: T[]): T[] {
    const byId = new Map<string, T>();
    for (const item of items)
        if (!byId.has(item.id)) byId.set(item.id, item);
    return [...byId.values()];
}
