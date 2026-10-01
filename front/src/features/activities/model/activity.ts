import {
    ActivitiesChildrenPaceOptions,
    ActivitiesFormatOptions,
    ActivitiesHostEffortOptions,
    ActivitiesImaginaryRuleOptions,
    ActivitiesLocationsOptions,
    ActivitiesPracticesOptions,
    ActivitiesSeasonsOptions,
    ActivitiesStateOptions,
    type ActivitiesResponse,
    type HTMLString,
} from "@/backend/schema.g";
import { distinctById } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/model/material";
import { StepKind, type ActivityResourceData, type ActivityStepData } from "@features/activities/model/step";
import { ActivityTagType, type ActivityTagData } from "@features/activities/model/tag";
import type { ActivityWorkshopData } from "@features/activities/model/workshop";

// ── The activity ────────────────────────────────────────────────────────────────────────────

/**
 * An activity as the app uses it. What identifies it sits at the top — which is also where the
 * list filters on it — and every other attribute is grouped by family, the way the activity
 * sheet template reads. `api/activity.mapper.ts` is what flattens the families back into
 * columns (ADR 0015).
 *
 * `steps`, `materials` and `workshops` are the records themselves, not their ids.
 */
export type ActivityData = Pick<ActivitiesResponse,
    'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'
    | 'name' | 'description' | 'state' | 'user' | 'visual'> & {
    /** What the cover visual has to show, until there is one. */
    visualBrief: string;

    classification: ActivityClassification;
    imaginary: ActivityImaginary;
    audience: ActivityAudience;
    supervision: ActivitySupervision;
    place: ActivityPlace;
    safety: ActivitySafety;
    pedagogy: ActivityPedagogy;

    steps: ActivityStepData[];
    materials: ActivityMaterialData[];
    workshops: ActivityWorkshopData[];
};

export const ActivityState = ActivitiesStateOptions;
export type ActivityState = ActivitiesStateOptions;

// ── Classification ──────────────────────────────────────────────────────────────────────────

/** What sorts an activity: its format, the practices of a workshop, and its stable subject. */
export interface ActivityClassification {
    format: ActivityFormat | null;
    practices: ActivityPractice[];
    themes: ActivityTagData[];
}

export const ActivityFormat = ActivitiesFormatOptions;
export type ActivityFormat = ActivitiesFormatOptions;

export const ActivityPractice = ActivitiesPracticesOptions;
export type ActivityPractice = ActivitiesPracticesOptions;

// ── Imaginary ───────────────────────────────────────────────────────────────────────────────

/** The narrative universe an activity is dressed in, if any, and whether it may change. */
export interface ActivityImaginary {
    rule: ImaginaryRule | null;
    universes: ActivityTagData[];
}

export const ImaginaryRule = ActivitiesImaginaryRuleOptions;
export type ImaginaryRule = ActivitiesImaginaryRuleOptions;

// ── Audience ────────────────────────────────────────────────────────────────────────────────

/** Who the activity is for. A 0 in a bound is unset: no limit on that side. */
export interface ActivityAudience {
    ageMin: number;
    ageMax: number;
    participantsMin: number;
    participantsMax: number;
    childrenPace: ChildrenPace | null;
    /** How durations and rules adapt to each age range. */
    ageVariants: HTMLString;
}

export const ChildrenPace = ActivitiesChildrenPaceOptions;
export type ChildrenPace = ActivitiesChildrenPaceOptions;

/** A bound of the audience as a range reads it: `null` is unset, no limit on that side. */
export type RangeEnd = number | null;

/**
 * A stored bound as a range reads it. PocketBase stores an empty number as 0, and no bound here
 * means anything by a 0 — so 0 is unset, and a new activity's `ageMax: 0` does not pin the upper
 * end to the floor.
 */
export function rangeEndOf(value: number | null | undefined): RangeEnd {
    return value ? value : null;
}

/** And back: an unset end is stored as the 0 PocketBase would store anyway. */
export function columnOf(value: RangeEnd | undefined): number {
    return value ?? 0;
}

// ── Supervision ─────────────────────────────────────────────────────────────────────────────

/** What running the activity asks of the adults. */
export interface ActivitySupervision {
    hostEffort: HostEffort | null;
    /** Entered by the author until the supervision referential can compute it. */
    hostsRequired: number;
    /** Whether an adult has to watch over every workshop, beyond those holding one. */
    crossSupervision: boolean;
    notes: HTMLString;
}

export const HostEffort = ActivitiesHostEffortOptions;
export type HostEffort = ActivitiesHostEffortOptions;

// ── Place ───────────────────────────────────────────────────────────────────────────────────

/** Where and when the activity can take place. */
export interface ActivityPlace {
    indoor: boolean;
    outdoor: boolean;
    /** Background detail — does not replace the two flags above. */
    locations: ActivityLocation[];
    /** What is indispensable: space, ground, water, accessibility… */
    conditions: HTMLString;
    seasons: ActivitySeason[];
}

export const ActivityLocation = ActivitiesLocationsOptions;
export type ActivityLocation = ActivitiesLocationsOptions;

export const ActivitySeason = ActivitiesSeasonsOptions;
export type ActivitySeason = ActivitiesSeasonsOptions;

// ── Safety ──────────────────────────────────────────────────────────────────────────────────

export interface ActivitySafety {
    tags: ActivityTagData[];
}

// ── Pedagogy ────────────────────────────────────────────────────────────────────────────────

/** What the activity is good for, as the animator would say it, and what it develops. */
export interface ActivityPedagogy {
    goals: ActivityTagData[];
    idealFor: ActivityTagData[];
    development: Record<DevelopmentAxis, ActivityTagData[]>;
}

/** The six developmental axes, each a kind of tag. */
export const DEVELOPMENT_AXES = [
    ActivityTagType.DEVELOP_PHYSICAL,
    ActivityTagType.DEVELOP_INTELLECTUAL,
    ActivityTagType.DEVELOP_AFFECT,
    ActivityTagType.DEVELOP_SOCIAL,
    ActivityTagType.DEVELOP_MORAL,
    ActivityTagType.DEVELOP_SPIRITUAL,
] as const;
export type DevelopmentAxis = typeof DEVELOPMENT_AXES[number];

/** Every axis, with no tag yet. */
export function emptyDevelopment(): Record<DevelopmentAxis, ActivityTagData[]> {
    return Object.fromEntries(
        DEVELOPMENT_AXES.map(axis => [axis, [] as ActivityTagData[]]),
    ) as Record<DevelopmentAxis, ActivityTagData[]>;
}

// ── What the steps add up to ────────────────────────────────────────────────────────────────

/** Every resource attached to an activity's steps, each once, in first-use order. */
export function resourcesOf(activity: ActivityData | null | undefined): ActivityResourceData[] {
    return distinctById((activity?.steps ?? []).flatMap(step => step.resources ?? []));
}

/** The two durations the sheet shows, in minutes. */
export interface ActivityTiming {
    /** Before the children arrive: the steps preparing the game. */
    preparation: number;
    /** Every other step, from gathering the children to the conclusion. */
    play: number;
}

/**
 * The activity's durations, as the sum of its steps' own. Gathering the material is a step the
 * app generates, not one the author writes, so it adds nothing.
 */
export function timingOf(activity: Pick<ActivityData, 'steps'> | null | undefined): ActivityTiming {
    const timing: ActivityTiming = { preparation: 0, play: 0 };

    for (const step of activity?.steps ?? []) {
        const minutes = step.duration || 0;
        if (step.kind === StepKind.PREPARE) timing.preparation += minutes;
        else timing.play += minutes;
    }

    return timing;
}

/** How long the activity takes from start to finish, preparation included, in minutes. */
export function totalMinutesOf(activity: Pick<ActivityData, 'steps'> | null | undefined): number {
    const { preparation, play } = timingOf(activity);
    return preparation + play;
}
