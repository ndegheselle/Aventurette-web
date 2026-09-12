import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { ActivityMaterialData } from "@features/activities/model/material";

const materials = crud<ActivityMaterialData>(Collections.StepsMaterials);

// Not a reference collection any more: every material belongs to one step, so picking a name
// writes a row of this step's own rather than linking someone else's.
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
