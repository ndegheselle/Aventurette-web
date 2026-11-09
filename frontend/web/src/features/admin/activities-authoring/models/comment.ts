/**
 * What a user said of an activity after running it, as its author reads it: one per user, from
 * their feedback.
 */
export interface ActivityCommentData {
    id: string;
    activity: string;
    comment: string;
    liked: boolean;
    /** The user's name, or null when they gave none. */
    author: string | null;
    updated: Date;
}

/**
 * The feedback that says something, latest first. A like alone, or a comment taken back, leaves
 * an empty comment behind: there is nothing to read in it.
 */
export function commentsToRead(feedback: ActivityCommentData[]): ActivityCommentData[] {
    return feedback
        .filter(item => item.comment.trim() !== '')
        .toSorted((a, b) => b.updated.getTime() - a.updated.getTime());
}
