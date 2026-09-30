import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { workshopMapper } from "@features/activities/api/workshop.mapper";

// Like a step, a workshop is a record of its own, written before the activity links it.
export const workshopsApi = crud(Collections.ActivitiesWorkshops, workshopMapper);
