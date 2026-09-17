import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { ActivityMaterialData, ActivityResourceData } from "@features/activities/model/step";
import { materialMapper, resourceMapper, stepMapper } from "@features/activities/model/step.mapper";

// Saving an activity stores its step ids and nothing else, so a step is written through here
// first — and so are its materials and resources, which are records of their own too.
export const stepsApi = crud(Collections.ActivitiesSteps, stepMapper);

const materials = crud(Collections.StepsMaterials, materialMapper);

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

const resources = crud(Collections.StepsResources, resourceMapper);

export const resourcesApi = {
    /**
     * Store a picked file as the resource record a step points at. `file` goes up as the upload;
     * what comes back carries the url to read it from.
     */
    async upload(file: File, step: string): Promise<ActivityResourceData> {
        return await resources.create({ name: file.name, file, step } as ActivityResourceData);
    },
};
