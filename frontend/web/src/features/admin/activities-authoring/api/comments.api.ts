import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { createFilter, createGroup, FilterOperator } from "@chapelure/core";
import { commentMapper } from "@features/admin/activities-authoring/api/comment.mapper";
import { commentsToRead, type ActivityCommentData } from "@features/admin/activities-authoring/models/comment";

// The collection lets an admin read every user's feedback, and nobody else's but their own.
const feedback = crud(Collections.UserActivityFeedback, commentMapper);

/** One feedback per user: more than an activity is expected to gather for now. */
const MAX_FEEDBACK = 200;

export const commentsApi = {
    /** What users said of one activity, latest first. */
    async ofActivity(activity: string): Promise<ActivityCommentData[]> {
        const ofThisActivity = createGroup<ActivityCommentData>({
            filters: [
                createFilter<ActivityCommentData>({ key: 'activity', value: activity, operator: FilterOperator.Equals }),
            ],
        });
        const found = await feedback.filter(ofThisActivity, { page: 1, perPage: MAX_FEEDBACK });
        return commentsToRead(found.items);
    },
};
