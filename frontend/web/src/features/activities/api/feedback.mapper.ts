import type { UserActivityFeedbackResponse } from "@/backend/schema.g";
import { plainMapper, type EntityMapper } from "@chapelure/core";
import type { FeedbackData } from "@features/activities/models/feedback";

/** A feedback as the backend stores it. */
export type FeedbackPayload = UserActivityFeedbackResponse;

export const feedbackMapper: EntityMapper<FeedbackPayload, FeedbackData> = plainMapper<FeedbackPayload>();
