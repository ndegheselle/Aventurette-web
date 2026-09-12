import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { STEP_RELATIONS, type ActivityStepData } from "@features/activities/model/activity";

// A step is a record of its own: saving an activity stores its step ids and nothing else, so
// the steps have to be written here first.
export const stepsApi = crud<ActivityStepData>(Collections.ActivitiesSteps, STEP_RELATIONS);
