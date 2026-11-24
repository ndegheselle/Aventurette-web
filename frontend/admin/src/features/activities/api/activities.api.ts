import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { activityMapper } from "@features/activities/api/activity.mapper";

export const activitiesApi = crud(Collections.Activities, activityMapper);
