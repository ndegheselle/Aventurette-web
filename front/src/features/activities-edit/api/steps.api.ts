import { crud, fileUrls } from "@/backend";
import { Collections } from "@/backend/schema.g";
import {
    STEP_RELATIONS,
    type ActivityMaterialData,
    type ActivityResourceData,
    type ActivityStepData,
} from "@features/activities/model/step";

// A step is a record of its own: saving an activity stores its step ids and nothing else, so
// the steps have to be written here first. Its materials and resources are records of their
// own too, which is why all three collections are reached from this one file.
export const stepsApi = crud<ActivityStepData>(Collections.ActivitiesSteps, STEP_RELATIONS);

const materials = crud<ActivityMaterialData>(Collections.StepsMaterials);

// Not a reference collection: every material belongs to one step, so picking a name writes a
// row of this step's own rather than linking someone else's.
export const materialsApi = {
    /**
     * Add a material to a step.
     *
     * `step` is required by the collection, and the cast is what a create costs — the
     * collection fills in the id.
     */
    async create(name: string, step: string): Promise<ActivityMaterialData> {
        return await materials.create({ name: name.trim(), step } as ActivityMaterialData);
    },

    /**
     * Every material row, which is what the name suggestions are drawn from.
     *
     * XXX : this reads the whole collection to offer a handful of names. A view collection
     * exposing distinct names would be the real fix — see the feature document.
     */
    getAll(): Promise<ActivityMaterialData[]> {
        return materials.getAll();
    },
};

const resources = crud<ActivityResourceData>(Collections.StepsResources);

export const resourcesApi = {
    /**
     * Store a picked file as the resource record a step points at.
     *
     * `step` is required by the collection: a resource belongs to the step it was uploaded
     * for. The cast is what a create costs — the collection is the one that fills in the id,
     * and `file` goes up as the upload where the stored record holds its name.
     */
    async upload(file: File, step: string): Promise<ActivityResourceData> {
        return await resources.create({ name: file.name, file, step } as unknown as ActivityResourceData);
    },

    /** Url of the file stored for a resource. */
    getFileUrl(resource: ActivityResourceData): string {
        return fileUrls.getUrl(resource, resource.file);
    },
};
