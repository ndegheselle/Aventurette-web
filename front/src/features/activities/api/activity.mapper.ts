import type { ActivitiesResponse } from "@/backend/schema.g";
import type { BaseEntity, EntityMapper } from "@chapelure/core";
import { activityMaterialMapper, type ActivityMaterialPayload } from "@features/activities/api/material.mapper";
import { stepMapper, type ActivityStepPayload } from "@features/activities/api/step.mapper";
import { tagMapper, type ActivityTagPayload } from "@features/activities/api/tag.mapper";
import { workshopMapper, type ActivityWorkshopPayload } from "@features/activities/api/workshop.mapper";
import { DEVELOPMENT_AXES, type ActivityData, type DevelopmentAxis } from "@features/activities/model/activity";
import type { ActivityTagData } from "@features/activities/model/tag";

/** An activity as the backend stores it, with what an expanded read carries alongside. */
export type ActivityPayload = ActivitiesResponse<{
    steps?: ActivityStepPayload[];
    materials?: ActivityMaterialPayload[];
    workshops?: ActivityWorkshopPayload[];
    theme_tags?: ActivityTagPayload[];
    imaginary_tags?: ActivityTagPayload[];
    safety_tags?: ActivityTagPayload[];
    goal_tags?: ActivityTagPayload[];
    ideal_for_tags?: ActivityTagPayload[];
    development_tags?: ActivityTagPayload[];
}>;

/** The tag relations, one per place a tag goes in the families. */
const TAG_RELATIONS = [
    'theme_tags', 'imaginary_tags', 'safety_tags', 'goal_tags', 'ideal_for_tags', 'development_tags',
] as const;
type TagRelation = typeof TAG_RELATIONS[number];

/** A relation goes back as the ids of its records. */
function ids(records: BaseEntity[]): string[] {
    return records.map(record => record.id);
}

/** An unset choice is the empty string the backend stores for one, which its type leaves out. */
function choice<T extends string>(value: T | ''): T {
    return value as T;
}

/**
 * Reads and writes an activity. The columns are flat; the entity groups them by family, and this
 * is the one place that knows which column belongs to which (ADR 0015). Each place a tag goes has
 * a relation of its own; the six development axes share one, and are sorted apart by kind.
 *
 * Steps, materials, workshops and tags arrive as records — their own mappers' work — and go back
 * as ids, because saving an activity persists its links and nothing under them.
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
    ],
    toEntity: (activity, files) => {
        const { expand } = activity;
        const tags = (relation: TagRelation) => (expand?.[relation] ?? []).map(tag => tagMapper.toEntity(tag, files));
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
                format: activity.format,
                practices: activity.practices ?? [],
                themes: tags('theme_tags'),
            },
            imaginary: {
                rule: activity.imaginary_rule,
                universes: tags('imaginary_tags'),
            },
            audience: {
                ageMin: activity.age_min,
                ageMax: activity.age_max,
                participantsMin: activity.participants_min,
                participantsMax: activity.participants_max,
                childrenPace: activity.children_pace,
                ageVariants: activity.age_variants,
            },
            supervision: {
                hostEffort: activity.host_effort,
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
                tags: tags('safety_tags'),
            },
            pedagogy: {
                goals: tags('goal_tags'),
                idealFor: tags('ideal_for_tags'),
                development: development as Record<DevelopmentAxis, ActivityTagData[]>,
            },

            steps: (expand?.steps ?? []).map(step => stepMapper.toEntity(step, files)),
            materials: (expand?.materials ?? []).map(material => activityMaterialMapper.toEntity(material, files)),
            workshops: (expand?.workshops ?? []).map(workshop => workshopMapper.toEntity(workshop, files)),
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
                format: choice(classification.format),
                practices: classification.practices,
                theme_tags: ids(classification.themes),
            }),
            ...(imaginary && {
                imaginary_rule: choice(imaginary.rule),
                imaginary_tags: ids(imaginary.universes),
            }),
            ...(audience && {
                age_min: audience.ageMin,
                age_max: audience.ageMax,
                participants_min: audience.participantsMin,
                participants_max: audience.participantsMax,
                children_pace: choice(audience.childrenPace),
                age_variants: audience.ageVariants,
            }),
            ...(supervision && {
                host_effort: choice(supervision.hostEffort),
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
            ...(safety && { safety_tags: ids(safety.tags) }),
            ...(pedagogy && {
                goal_tags: ids(pedagogy.goals),
                ideal_for_tags: ids(pedagogy.idealFor),
                development_tags: ids(Object.values(pedagogy.development).flat()),
            }),
            ...(steps && { steps: ids(steps) }),
            ...(materials && { materials: ids(materials) }),
            ...(workshops && { workshops: ids(workshops) }),
        };
    },
};
