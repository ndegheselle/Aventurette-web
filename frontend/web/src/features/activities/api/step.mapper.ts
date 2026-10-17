import type { ActivitiesStepsResponse, StepsResourcesResponse } from "@/backend/schema.g";
import { toEntities, toIds, type EntityMapper } from "@chapelure/core";
import { activityMaterialMapper, type ActivityMaterialPayload } from "@features/activities/api/material.mapper";
import { tipMapper, type ActivityTipPayload } from "@features/activities/api/tip.mapper";
import type { ActivityResourceData, ActivityStepData } from "@features/activities/models/step";

/**
 * A resource as the backend stores it. `file` is the stored file's name coming back and the
 * upload itself going up — the asymmetry the entity's `url` exists to hide.
 */
export type ActivityResourcePayload = Omit<StepsResourcesResponse, 'file'> & { file?: string | File };

export const resourceMapper: EntityMapper<ActivityResourcePayload, ActivityResourceData> = {
    relations: [],
    toEntity: ({ expand: _expand, file, ...resource }, files) => ({
        ...resource,
        url: typeof file === 'string' && file ? files.getUrl(resource, file) : '',
    }),
    toPayload: ({ url: _url, ...resource }) => resource,
};

/** A step as the backend stores it, with what an expanded read carries alongside. */
export type ActivityStepPayload = ActivitiesStepsResponse<{
    materials?: ActivityMaterialPayload[];
    resources?: ActivityResourcePayload[];
    tips?: ActivityTipPayload[];
}>;

/**
 * Reads and writes a step. The columns the app sets aside are dropped on read, so nothing above
 * `api/` holds them and no write sends them back.
 */
export const stepMapper: EntityMapper<ActivityStepPayload, ActivityStepData> = {
    relations: [
        "materials",
        ...activityMaterialMapper.relations.map(relation => `materials.${relation}`),
        "resources",
        "tips",
    ],
    toEntity: ({
        expand,
        visual_brief: _visualBrief, end_criteria: _endCriteria, end_criteria_other: _endCriteriaOther,
        ...step
    }, files) => ({
        ...step,
        materials: toEntities(expand?.materials, activityMaterialMapper, files),
        resources: toEntities(expand?.resources, resourceMapper, files),
        tips: toEntities(expand?.tips, tipMapper, files),
    }),
    toPayload: ({ materials, resources, tips, ...step }) => ({
        ...step,
        ...(materials && { materials: toIds(materials) }),
        ...(resources && { resources: toIds(resources) }),
        ...(tips && { tips: toIds(tips) }),
    }),
};
