import { crud, fileUrls } from "@/backend";
import { Collections } from "@/backend/schema.g";
import {
    STEP_RELATIONS,
    type ActivityMaterialData,
    type ActivityResourceData,
    type ActivityStepData,
} from "@features/activities/model/step";

// Saving an activity stores its step ids and nothing else, so a step is written through here
// first — and so are its materials and resources, which are records of their own too.
export const stepsApi = crud<ActivityStepData>(Collections.ActivitiesSteps, STEP_RELATIONS);

const materials = crud<ActivityMaterialData>(Collections.StepsMaterials);

// Not a reference collection: a material belongs to one step, so picking a name writes a new row.
export const materialsApi = {
    /** Add a material to a step. The cast is what a create costs: the collection fills in the id. */
    async create(name: string, step: string): Promise<ActivityMaterialData> {
        return await materials.create({ name: name.trim(), step } as ActivityMaterialData);
    },

    /**
     * Every material row — what the name suggestions are drawn from.
     *
     * XXX : reads the whole collection to offer a handful of names. A view collection exposing
     * distinct names would be the real fix — see the feature document.
     */
    getAll(): Promise<ActivityMaterialData[]> {
        return materials.getAll();
    },
};

const resources = crud<ActivityResourceData>(Collections.StepsResources);

export const resourcesApi = {
    /**
     * Store a picked file as the resource record a step points at. `file` goes up as the upload;
     * the stored record holds its name.
     */
    async upload(file: File, step: string): Promise<ActivityResourceData> {
        return await resources.create({ name: file.name, file, step } as unknown as ActivityResourceData);
    },

    /** Url of the file stored for a resource. */
    getFileUrl(resource: ActivityResourceData): string {
        return fileUrls.getUrl(resource, resource.file);
    },
};
