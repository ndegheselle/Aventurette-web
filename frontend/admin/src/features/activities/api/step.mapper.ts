import type { ActivitiesStepsResponse, FileNameString, StepsResourcesResponse } from "@/backend/schema.g";
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

/**
 * A step as the backend stores it, with what an expanded read carries alongside. `visual` is the
 * stored file's name coming back, and the upload going up, as a resource's `file` is.
 */
export type ActivityStepPayload = Omit<ActivitiesStepsResponse<{
    materials?: ActivityMaterialPayload[];
    resources?: ActivityResourcePayload[];
    tips?: ActivityTipPayload[];
}>, 'visual'> & { visual?: string | File };

/** Reads and writes a step. */
export const stepMapper: EntityMapper<ActivityStepPayload, ActivityStepData> = {
    relations: [
        "materials",
        ...activityMaterialMapper.relations.map(relation => `materials.${relation}`),
        "resources",
        "tips",
    ],
    toEntity: ({ expand, visual, ...step }, files) => ({
        ...step,
        visual: (typeof visual === 'string' ? visual : '') as FileNameString,
        visualUrl: typeof visual === 'string' && visual ? files.getUrl(step, visual) : '',
        materials: toEntities(expand?.materials, activityMaterialMapper, files),
        resources: toEntities(expand?.resources, resourceMapper, files),
        tips: toEntities(expand?.tips, tipMapper, files),
    }),
    // A stored picture is left as it is: only a new one, or none, is written.
    toPayload: ({ materials, resources, tips, visual, visualUrl: _url, visualFile, ...step }) => ({
        ...step,
        ...(visualFile ? { visual: visualFile } : visual === '' ? { visual: '' } : {}),
        ...(materials && { materials: toIds(materials) }),
        ...(resources && { resources: toIds(resources) }),
        ...(tips && { tips: toIds(tips) }),
    }),
};
