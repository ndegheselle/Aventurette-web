import type { ActivitiesStepsResponse, StepsMaterialsResponse, StepsResourcesResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type {
    ActivityMaterialData,
    ActivityResourceData,
    ActivityStepData,
} from "@features/activities/model/step";

/** A material as the backend stores it. */
export type ActivityMaterialPayload = StepsMaterialsResponse;

export const materialMapper: EntityMapper<ActivityMaterialPayload, ActivityMaterialData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...material }) => material,
    toPayload: (material) => material,
};

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
}>;

export const stepMapper: EntityMapper<ActivityStepPayload, ActivityStepData> = {
    relations: ["materials", "resources"],
    toEntity: ({ expand, ...step }, files) => ({
        ...step,
        materials: (expand?.materials ?? []).map(material => materialMapper.toEntity(material, files)),
        resources: (expand?.resources ?? []).map(resource => resourceMapper.toEntity(resource, files)),
    }),
    toPayload: ({ materials, resources, ...step }) => ({
        ...step,
        ...(materials && { materials: materials.map(material => material.id) }),
        ...(resources && { resources: resources.map(resource => resource.id) }),
    }),
};
