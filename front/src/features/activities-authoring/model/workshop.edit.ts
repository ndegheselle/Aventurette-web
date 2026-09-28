import type { ActivityMaterialData } from "@features/activities/model/material";
import type { ActivityWorkshopData } from "@features/activities/model/workshop";

/**
 * A blank workshop, written the moment one is added — like a step, so the modal only ever
 * updates. `name` is required by the collection, hence the placeholder.
 */
export function createEmptyWorkshop(activity: string, name: string): ActivityWorkshopData {
    return {
        activity,
        name,
        theme: "",
        challenges: "",
        adults_required: 0,
        materials: [] as ActivityMaterialData[],
    } as ActivityWorkshopData;
}
