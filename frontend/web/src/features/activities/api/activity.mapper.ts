import type { ActivitiesResponse } from "@/backend/schema.g";
import {
    createFilter,
    createGroup,
    createSearchFilter,
    emptyIfNull,
    FilterLogical,
    FilterOperator,
    toEntities,
    toIds,
    type EntityMapper,
    type Filter,
    type FilterGroup,
} from "@chapelure/core";
import { activityMaterialMapper, type ActivityMaterialPayload } from "@features/activities/api/material.mapper";
import { safetyInstructionMapper, type SafetyInstructionPayload } from "@features/activities/api/safety.mapper";
import { stepMapper, type ActivityStepPayload } from "@features/activities/api/step.mapper";
import { tagMapper, type ActivityTagPayload } from "@features/activities/api/tag.mapper";
import { workshopMapper, type ActivityWorkshopPayload } from "@features/activities/api/workshop.mapper";
import { DEVELOPMENT_AXES, type ActivityData, type DevelopmentAxis } from "@features/activities/models/activity";
import type { CatalogueFilters } from "@features/activities/models/catalogueFilters";
import type { ActivityTagData } from "@features/activities/models/tag";

/** An activity as the backend stores it, with what an expanded read carries alongside. */
export type ActivityPayload = ActivitiesResponse<{
    steps?: ActivityStepPayload[];
    materials?: ActivityMaterialPayload[];
    workshops?: ActivityWorkshopPayload[];
    theme_tags?: ActivityTagPayload[];
    imaginary_tags?: ActivityTagPayload[];
    goal_tags?: ActivityTagPayload[];
    ideal_for_tags?: ActivityTagPayload[];
    development_tags?: ActivityTagPayload[];
    safety_instructions?: SafetyInstructionPayload[];
}>;

/** The tag relations, one per place a tag goes in the families. */
const TAG_RELATIONS = [
    'theme_tags', 'imaginary_tags', 'goal_tags', 'ideal_for_tags', 'development_tags',
] as const;
type TagRelation = typeof TAG_RELATIONS[number];

/**
 * The columns stay flat and the entity groups them by family (ADR 0015), so this is where the
 * two meet: each family is read out of its columns, and written back into them.
 */
export const activityMapper: EntityMapper<ActivityPayload, ActivityData> = {
    relations: [
        "steps",
        ...stepMapper.relations.map(relation => `steps.${relation}`),
        "materials",
        ...activityMaterialMapper.relations.map(relation => `materials.${relation}`),
        "workshops",
        ...workshopMapper.relations.map(relation => `workshops.${relation}`),
        ...TAG_RELATIONS,
        "safety_instructions",
    ],
    toEntity: (activity, files) => {
        const { expand } = activity;
        const tags = (relation: TagRelation) => toEntities(expand?.[relation], tagMapper, files);
        const developmentTags = tags('development_tags');
        const development = Object.fromEntries(
            DEVELOPMENT_AXES.map(axis => [axis, developmentTags.filter(tag => tag.type === axis)]),
        );

        return {
            id: activity.id,
            created: activity.created,
            updated: activity.updated,
            collectionId: activity.collectionId,
            collectionName: activity.collectionName,
            name: activity.name,
            description: activity.description,
            state: activity.state,
            user: activity.user,
            visual: activity.visual,
            visualBrief: activity.visual_brief,

            classification: {
                format: activity.format || null,
                practices: activity.practices ?? [],
                themes: tags('theme_tags'),
            },
            imaginary: {
                rule: activity.imaginary_rule || null,
                universes: tags('imaginary_tags'),
            },
            audience: {
                ageMin: activity.age_min,
                ageMax: activity.age_max,
                participantsMin: activity.participants_min,
                participantsMax: activity.participants_max,
                childrenPace: activity.children_pace || null,
                ageVariants: activity.age_variants,
            },
            supervision: {
                hostEffort: activity.host_effort || null,
                hostsRequired: activity.recommended_hosts_numbers,
                crossSupervision: activity.cross_supervision,
                notes: activity.supervision_notes,
            },
            place: {
                indoor: activity.indoor,
                outdoor: activity.outdoor,
                locations: activity.locations ?? [],
                conditions: activity.conditions,
                seasons: activity.seasons ?? [],
            },
            safety: {
                instructions: toEntities(expand?.safety_instructions, safetyInstructionMapper, files),
            },
            pedagogy: {
                goals: tags('goal_tags'),
                idealFor: tags('ideal_for_tags'),
                development: development as Record<DevelopmentAxis, ActivityTagData[]>,
            },

            steps: toEntities(expand?.steps, stepMapper, files),
            materials: toEntities(expand?.materials, activityMaterialMapper, files),
            workshops: toEntities(expand?.workshops, workshopMapper, files),
        };
    },
    toPayload: (activity) => {
        const {
            visualBrief, classification, imaginary, audience, supervision, place, safety, pedagogy,
            steps, materials, workshops,
            ...columns
        } = activity;

        return {
            ...columns,
            ...(visualBrief !== undefined && { visual_brief: visualBrief }),
            ...(classification && {
                format: emptyIfNull(classification.format),
                practices: classification.practices,
                theme_tags: toIds(classification.themes),
            }),
            ...(imaginary && {
                imaginary_rule: emptyIfNull(imaginary.rule),
                imaginary_tags: toIds(imaginary.universes),
            }),
            ...(audience && {
                age_min: audience.ageMin,
                age_max: audience.ageMax,
                participants_min: audience.participantsMin,
                participants_max: audience.participantsMax,
                children_pace: emptyIfNull(audience.childrenPace),
                age_variants: audience.ageVariants,
            }),
            ...(supervision && {
                host_effort: emptyIfNull(supervision.hostEffort),
                recommended_hosts_numbers: supervision.hostsRequired,
                cross_supervision: supervision.crossSupervision,
                supervision_notes: supervision.notes,
            }),
            ...(place && {
                indoor: place.indoor,
                outdoor: place.outdoor,
                locations: place.locations,
                conditions: place.conditions,
                seasons: place.seasons,
            }),
            ...(safety && { safety_instructions: toIds(safety.instructions) }),
            ...(pedagogy && {
                goal_tags: toIds(pedagogy.goals),
                ideal_for_tags: toIds(pedagogy.idealFor),
                development_tags: toIds(Object.values(pedagogy.development).flat()),
            }),
            ...(steps && { steps: toIds(steps) }),
            ...(materials && { materials: toIds(materials) }),
            ...(workshops && { workshops: toIds(workshops) }),
        };
    },
};

// ── The catalogue's filters ─────────────────────────────────────────────────────────────────

type ActivityFilter = Filter<ActivityPayload> | FilterGroup<ActivityPayload>;

/** A column, or `<column>:each` for the values of a multiple select, one at a time. */
type FilterKey = keyof ActivityPayload | `${keyof ActivityPayload}:each`;

const where = (key: FilterKey, operator: FilterOperator, value: unknown, combine: FilterLogical = FilterLogical.And) =>
    createFilter<ActivityPayload>({ key: key as keyof ActivityPayload, operator, value, combine });

/**
 * The ages an activity is for overlap the ones asked for. A 0 in either column is unset: no
 * limit on that side, so an activity with no upper age is for every age from its lower one.
 */
function agesOverlap(min: number | null, max: number | null): ActivityFilter[] {
    return [
        ...(min !== null ? [createGroup<ActivityPayload>({
            filters: [
                where('age_max', FilterOperator.GreaterOrEquals, min, FilterLogical.Or),
                where('age_max', FilterOperator.Equals, 0),
            ],
        })] : []),
        // A 0 lower bound is below any asked for, so it needs no case of its own.
        ...(max !== null ? [where('age_min', FilterOperator.LessOrEquals, max)] : []),
    ];
}

/** `duration` is the sum of the steps', kept on the activity by a backend hook. */
function durationWithin(min: number | null, max: number | null): ActivityFilter[] {
    return [
        ...(min !== null ? [where('duration', FilterOperator.GreaterOrEquals, min)] : []),
        ...(max !== null ? [where('duration', FilterOperator.LessOrEquals, max)] : []),
    ];
}

/**
 * The catalogue's search and filters as the backend reads them, every one of them required.
 * Within a list, any one value chosen is enough: an activity in the park or the forest. A list
 * nothing is chosen in, and an empty search, filter on nothing.
 *
 * A multiple select is compared through `:each`: `locations ?= 'PARK'` compares the whole stored
 * list and matches nothing, where `locations:each ?= 'PARK'` matches an activity holding it.
 */
export function catalogueFilterOf(filters: CatalogueFilters, search: string): FilterGroup<ActivityPayload> {
    const anyOf = (key: FilterKey, operator: FilterOperator, values: string[]) =>
        values.length ? [where(key, operator, values)] : [];
    const searched = search.trim();

    return createGroup<ActivityPayload>({
        filters: [
            ...(searched ? [createSearchFilter<ActivityPayload>(searched, ['name', 'description'])] : []),
            ...agesOverlap(filters.ageMin, filters.ageMax),
            ...durationWithin(filters.durationMin, filters.durationMax),
            ...anyOf('locations:each', FilterOperator.AnyEquals, filters.locations),
            ...anyOf('format', FilterOperator.Equals, filters.formats),
            ...anyOf('practices:each', FilterOperator.AnyEquals, filters.practices),
            ...anyOf('children_pace', FilterOperator.Equals, filters.childrenPaces),
            ...anyOf('seasons:each', FilterOperator.AnyEquals, filters.seasons),
        ],
    });
}
