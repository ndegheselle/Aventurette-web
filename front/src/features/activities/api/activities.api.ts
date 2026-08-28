import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { ACTIVITY_RELATIONS, type ActivityData } from "@features/activities/model/activity";

export const activitiesApi = crud<ActivityData>(Collections.Activities, ACTIVITY_RELATIONS);
