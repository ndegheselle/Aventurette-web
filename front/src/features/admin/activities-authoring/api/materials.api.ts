import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { materialMapper } from "@features/activities/api/material.mapper";
import type { MaterialData } from "@features/activities/model/material";

const catalogue = crud(Collections.Materials, materialMapper);

// The editor picks from the catalogue. A name nobody has used yet is added to it by the
// activity's save (`save.api.ts`); renaming and deleting are the `materials-authoring` feature's.
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
};
