import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { feedbackMapper } from "@features/activities/api/feedback.mapper";

// A user reads and writes their own feedback only; an admin reads everyone's.
export const feedbackApi = crud(Collections.UserActivityFeedback, feedbackMapper);
