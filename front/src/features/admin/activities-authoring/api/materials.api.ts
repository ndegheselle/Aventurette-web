import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { activityMaterialMapper, materialMapper } from "@features/activities/api/material.mapper";
import type { ActivityMaterialData, MaterialData } from "@features/activities/model/material";

const catalogue = crud(Collections.Materials, materialMapper);
const links = crud(Collections.ActivitiesMaterials, activityMaterialMapper);

// The editor picks from the catalogue, and adds to it a name nobody has used yet. Managing the
// catalogue itself — renaming, deleting — is the `materials-authoring` feature's.
export const materialsApi = {
    /**
     * Every catalogue material: what the editor suggests while a name is typed.
     *
     * XXX : reads the whole catalogue to offer a handful of names. A search on what is typed
     * would scale — see the feature document.
     */
    getAll(): Promise<MaterialData[]> {
        return catalogue.getAll();
    },

    /**
     * Add a name to the catalogue. Refused by the backend if the name is already there, whatever
     * its case. The cast is what a create costs: the collection fills in the id.
     */
    create(name: string): Promise<MaterialData> {
        return catalogue.create({ name: name.trim() } as MaterialData);
    },
};

// What an activity needs of the catalogue. Each write is its own — saving the activity stores
// which links it lists, not them.
export const activityMaterialsApi = {
    /** Link a catalogue material to an activity. What comes back carries the material's name. */
    link(activity: string, material: MaterialData, quantity: string = ""): Promise<ActivityMaterialData> {
        return links.create({ activity, material: material.id, quantity } as ActivityMaterialData);
    },

    update(link: ActivityMaterialData): Promise<ActivityMaterialData> {
        return links.update(link.id, link);
    },

    /**
     * Take a material off an activity. The backend drops the link from the activity's list and
     * from every step and workshop recalling it; the catalogue material stays.
     */
    unlink(id: string): Promise<void> {
        return links.remove(id);
    },
};
