import { commentsToRead, type ActivityCommentData } from '@features/admin/activities-authoring/models/comment';
import { describe, expect, it } from 'vitest';

function aComment(id: string, comment: string, updated: string): ActivityCommentData {
    return { id, activity: 'act-1', comment, liked: false, author: null, updated: new Date(updated) };
}

describe('commentsToRead', () => {
    it('leaves out feedback that says nothing, a like alone or a comment taken back', () => {
        const feedback = [
            aComment('said', 'Loved it', '2026-01-01'),
            aComment('liked-only', '', '2026-01-02'),
            aComment('blank', '   ', '2026-01-03'),
        ];

        expect(commentsToRead(feedback).map(item => item.id)).toEqual(['said']);
    });

    it('puts the latest first', () => {
        const feedback = [
            aComment('older', 'Fine', '2026-01-01'),
            aComment('newer', 'Great', '2026-03-01'),
        ];

        expect(commentsToRead(feedback).map(item => item.id)).toEqual(['newer', 'older']);
    });
});
