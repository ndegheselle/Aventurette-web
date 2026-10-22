import type { UserActivityFeedbackResponse } from "@/backend/schema.g";
import { createFilter, createGroup, FilterOperator, type Entity, type FilterGroup } from "@chapelure/core";

/**
 * What a user thought of an activity once they ran it: whether they liked it and a comment.
 * One per user and activity, updated rather than added to.
 */
export type FeedbackData = Entity<UserActivityFeedbackResponse>;

/** The feedback a user first gives an activity, before anything is liked or said. */
export function createFeedback(user: string, activity: string): FeedbackData {
    return { user, activity, liked: false, comment: '' } as FeedbackData;
}

/** What finds one user's feedback on one activity. */
export function feedbackFilter(user: string, activity: string): FilterGroup<FeedbackData> {
    return createGroup<FeedbackData>({
        filters: [
            createFilter<FeedbackData>({ key: 'user', value: user, operator: FilterOperator.Equals }),
            createFilter<FeedbackData>({ key: 'activity', value: activity, operator: FilterOperator.Equals }),
        ],
    });
}

/**
 * The comment to write as the user leaves: what they typed, trimmed, or null when that is what
 * is saved already. Emptying the field is a change: it takes the comment back.
 */
export function commentToSave(saved: string, typed: string): string | null {
    const comment = typed.trim();
    return comment === saved ? null : comment;
}
