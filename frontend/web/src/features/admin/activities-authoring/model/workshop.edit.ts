import type { FieldErrors } from "@chapelure/core";
import type { ActivityMaterialData } from "@features/activities/model/material";
import type { ActivityWorkshopData } from "@features/activities/model/workshop";

/**
 * A blank workshop, for the modal to fill in. Like a step's, its id is chosen here so the activity
 * can list it in the save that creates it. `name` is required by the collection, hence the
 * placeholder.
 */
export function createEmptyWorkshop(id: string, activity: string, name: string): ActivityWorkshopData {
    return {
        id,
        activity,
        name,
        theme: "",
        challenges: "",
        adults_required: 0,
        materials: [] as ActivityMaterialData[],
    } as ActivityWorkshopData;
}

/** What the collection would refuse in a workshop, checked as the modal closes — see `stepProblems`. */
export function workshopProblems(workshop: Pick<ActivityWorkshopData, 'name'>): FieldErrors {
    return workshop.name?.trim() ? {} : { name: { code: 'validation_required' } };
}
