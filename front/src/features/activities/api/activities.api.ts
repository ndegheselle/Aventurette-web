import { cachedCrud, crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { activityMapper, benefitMapper } from "@features/activities/api/activity.mapper";

export const activitiesApi = crud(Collections.Activities, activityMapper);

// Small reference collection: fetched once, then served from memory.
export const benefitsApi = cachedCrud(Collections.Benefits, benefitMapper);
