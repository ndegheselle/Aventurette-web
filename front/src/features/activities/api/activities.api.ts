import { cachedCrud, crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { ACTIVITY_RELATIONS, type ActivityData, type BenefitData } from "@features/activities/model/activity";

export const activitiesApi = crud<ActivityData>(Collections.Activities, ACTIVITY_RELATIONS);

// Small reference collection: fetched once, then served from memory.
export const benefitsApi = cachedCrud<BenefitData>(Collections.Benefits);
