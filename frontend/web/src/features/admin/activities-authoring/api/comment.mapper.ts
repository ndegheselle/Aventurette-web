import type { UserActivityFeedbackResponse, UsersResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type { ActivityCommentData } from "@features/admin/activities-authoring/models/comment";

/** A feedback as the backend stores it, with the user who gave it. */
export type ActivityCommentPayload = UserActivityFeedbackResponse<{ user?: UsersResponse }>;

/** Read only: comments are the users' to write, from the feedback screen. */
export const commentMapper: EntityMapper<ActivityCommentPayload, ActivityCommentData> = {
    relations: ['user'],
    toEntity: (feedback) => ({
        id: feedback.id,
        activity: feedback.activity,
        comment: feedback.comment,
        liked: feedback.liked,
        author: feedback.expand?.user?.name || null,
        // PocketBase separates the day and the time with a space, which `Date` does not read everywhere.
        updated: new Date(feedback.updated.replace(' ', 'T')),
    }),
    toPayload: () => ({}),
};
