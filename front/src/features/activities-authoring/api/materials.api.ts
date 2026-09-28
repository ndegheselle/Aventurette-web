import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { materialMapper } from "@features/activities/api/material.mapper";
import type { ActivityMaterialData } from "@features/activities/model/material";

const materials = crud(Collections.ActivitiesMaterials, materialMapper);

// Not a reference collection: a material belongs to one activity, so picking a name writes a new
// row. Each write is its own — saving the activity stores which materials it lists, not them.
export const materialsApi = {
    /** Add a material to an activity. The cast is what a create costs: the collection fills in the id. */
    async create(name: string, activity: string): Promise<ActivityMaterialData> {
        return await materials.create({ name: name.trim(), quantity: "", activity } as ActivityMaterialData);
    },

    update(material: ActivityMaterialData): Promise<ActivityMaterialData> {
        return materials.update(material.id, material);
    },

    /**
     * Delete a material. Nothing linking it cascades, so the activity, its steps and its
     * workshops only lose the link.
     */
    remove(id: string): Promise<void> {
        return materials.remove(id);
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
