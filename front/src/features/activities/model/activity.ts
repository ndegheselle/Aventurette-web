import {
    ActivitiesEnergyLevelOptions,
    ActivitiesEnvironnementOptions,
    ActivitiesSeasonOptions,
    ActivitiesStateOptions,
    ActivitiesWeatherOptions,
    type ActivitiesResponse,
} from "@/backend/schema.g";
import { distinctById, type Entity } from "@chapelure/core";
import type {
    ActivityMaterialData,
    ActivityResourceData,
    ActivityStepData,
} from "@features/activities/model/step";
import type { ActivityTagData } from "@features/activities/model/tag";

/**
 * An activity as the app uses it: `activity.steps` is the steps and `activity.tags` the tags, not
 * their ids. Everything else it holds is a column of its own.
 */
export type ActivityData = Entity<ActivitiesResponse, {
    steps: ActivityStepData[];
    tags: ActivityTagData[];
}>;

export const ActivityState = ActivitiesStateOptions;
export const ActivitiesEnvironnement = ActivitiesEnvironnementOptions;
export const ActivitiesSeason = ActivitiesSeasonOptions;
export const ActivitiesWeather = ActivitiesWeatherOptions;
export const ActivitiesEnergyLevel = ActivitiesEnergyLevelOptions;

/** Every material used across an activity's steps. */
export function materialsOf(activity: ActivityData | null | undefined): ActivityMaterialData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.materials ?? []));
}

/** Every resource attached to an activity's steps. See `materialsOf`. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}
