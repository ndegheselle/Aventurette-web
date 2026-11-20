import type { UserActivityFeedbackResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { ActivityCommentData } from "@features/admin/activities-authoring/models/comment";

/** A feedback as the backend stores it. */
export type ActivityCommentPayload = UserActivityFeedbackResponse;

/** Read only: comments are the users' to write, from the feedback screen. */
export const commentMapper: EntityMapper<ActivityCommentPayload, ActivityCommentData> = {
    relations: [],
    toEntity: (feedback) => ({
        id: feedback.id,
        activity: feedback.activity,
        comment: feedback.comment,
        liked: feedback.liked,
        // PocketBase separates the day and the time with a space, which `Date` does not read everywhere.
        updated: new Date(feedback.updated.replace(' ', 'T')),
    }),
    toPayload: () => ({}),
};
