import type { ActivitiesStepsResponse, StepsResourcesResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { materialMapper, type ActivityMaterialPayload } from "@features/activities/api/material.mapper";
import type { ActivityResourceData, ActivityStepData } from "@features/activities/model/step";

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
export type ActivityStepPayload = ActivitiesStepsResponse<string[], {
    materials?: ActivityMaterialPayload[];
    resources?: ActivityResourcePayload[];
}>;

/**
 * Reads and writes a step. `actions` is a JSON column: never set reads as no action, and an
 * action left blank in the editor is not written.
 */
export const stepMapper: EntityMapper<ActivityStepPayload, ActivityStepData> = {
    relations: ["materials", "resources"],
    toEntity: ({ expand, actions, ...step }, files) => ({
        ...step,
        actions: actions ?? [],
        materials: (expand?.materials ?? []).map(material => materialMapper.toEntity(material, files)),
        resources: (expand?.resources ?? []).map(resource => resourceMapper.toEntity(resource, files)),
    }),
    toPayload: ({ materials, resources, actions, ...step }) => ({
        ...step,
        ...(actions && { actions: actions.map(action => action.trim()).filter(Boolean) }),
        ...(materials && { materials: materials.map(material => material.id) }),
        ...(resources && { resources: resources.map(resource => resource.id) }),
    }),
};
