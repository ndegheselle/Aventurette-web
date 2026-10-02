import type { ActivitiesResponse } from "@/backend/schema.g";
import { convert, toEntities, toIds, type EntityMapper } from "@chapelure/core";
import { activityMaterialMapper, type ActivityMaterialPayload } from "@features/activities/api/material.mapper";
import { safetyInstructionMapper, type SafetyInstructionPayload } from "@features/activities/api/safety.mapper";
import { stepMapper, type ActivityStepPayload } from "@features/activities/api/step.mapper";
import { tagMapper, type ActivityTagPayload } from "@features/activities/api/tag.mapper";
import { tipMapper, type ActivityTipPayload } from "@features/activities/api/tip.mapper";
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
    goal_tags?: ActivityTagPayload[];
    ideal_for_tags?: ActivityTagPayload[];
    development_tags?: ActivityTagPayload[];
    safety_instructions?: SafetyInstructionPayload[];
    tips?: ActivityTipPayload[];
}>;

/** The tag relations, one per place a tag goes in the families. */
const TAG_RELATIONS = [
    'theme_tags', 'imaginary_tags', 'goal_tags', 'ideal_for_tags', 'development_tags',
] as const;
type TagRelation = typeof TAG_RELATIONS[number];

/**
 * Mapping between the domain object and the flat database object.
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
        "tips",
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

            steps: (expand?.steps ?? []).map(step => stepMapper.toEntity(step, files)),
            materials: (expand?.materials ?? []).map(material => activityMaterialMapper.toEntity(material, files)),
            workshops: (expand?.workshops ?? []).map(workshop => workshopMapper.toEntity(workshop, files)),
            tips: toEntities(expand?.tips, tipMapper, files),
        };
    },
    toPayload: (activity) => {
        const {
            visualBrief, classification, imaginary, audience, supervision, place, safety, pedagogy,
            steps, materials, workshops, tips,
            ...columns
        } = activity;

        return {
            ...columns,
            ...(visualBrief !== undefined && { visual_brief: visualBrief }),
            ...(classification && {
                format: convert(classification.format),
                practices: classification.practices,
                theme_tags: toIds(classification.themes),
            }),
            ...(imaginary && {
                imaginary_rule: convert(imaginary.rule),
                imaginary_tags: toIds(imaginary.universes),
            }),
            ...(audience && {
                age_min: audience.ageMin,
                age_max: audience.ageMax,
                participants_min: audience.participantsMin,
                participants_max: audience.participantsMax,
                children_pace: convert(audience.childrenPace),
                age_variants: audience.ageVariants,
            }),
            ...(supervision && {
                host_effort: convert(supervision.hostEffort),
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
            ...(tips && { tips: toIds(tips) }),
        };
    },
};
