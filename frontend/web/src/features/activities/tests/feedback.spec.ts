import type { ActivityData } from '@features/activities/models/activity';
import { commentToSave, type FeedbackData } from '@features/activities/models/feedback';
import { useActivityFeedback } from '@features/activities/composables/useActivityFeedback';
import routes, { routesNames } from '@features/activities/routes';
import { useAuth } from '@features/user/composables/useAuth';
import type { SessionUser } from '@features/user/models/user';
import { anActivity, aUser, createTestRouter, fakeAuthProvider, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('commentToSave', () => {
    it('writes what was typed, trimmed', () => {
        expect(commentToSave('', '  Loved it ')).toBe('Loved it');
    });

    it('writes nothing for a comment left as it was, spaces aside', () => {
        expect(commentToSave('Loved it', ' Loved it ')).toBeNull();
    });

    it('writes an emptied field: the comment is taken back', () => {
        expect(commentToSave('Loved it', '   ')).toBe('');
    });
});

// The backend holds one feedback per user and activity, under a unique index: a second create
// is refused there, and only there.

const activities = fakeCrud<ActivityData>();
const feedbacks = fakeCrud<FeedbackData>();
const user = aUser({ id: 'usr-1' });
const session = fakeAuthProvider<SessionUser>(user);

vi.mock('@features/activities/api/activities.api', () => ({
    get activitiesApi() { return activities; },
}));
vi.mock('@features/activities/api/feedback.api', () => ({
    get feedbackApi() { return feedbacks; },
}));
vi.mock('@features/user/api/session', () => ({ sessionProvider: () => session }));

async function setup() {
    const router = await createTestRouter({ routes, initialRoute: '/activities/act-1' });
    await router.push({ name: routesNames.feedback, params: { id: 'act-1' } });
    const [subject] = withSetup(() => useActivityFeedback(), router);
    await flushPromises();
    return { subject, router };
}

beforeEach(async () => {
    activities.items = [anActivity({ id: 'act-1' })];
    feedbacks.items = [];
    const [auth] = withSetup(() => useAuth());
    await auth.login('parent@example.com', 'secret');
});

describe('useActivityFeedback', () => {
    it('updates the feedback a first like created, rather than creating a second one', async () => {
        const { subject } = await setup();

        await subject.toggleLike();
        subject.comment.value = 'Loved it';
        await subject.leave();

        expect(feedbacks.items).toHaveLength(1);
        expect(feedbacks.items[0]).toMatchObject({ user: 'usr-1', activity: 'act-1', liked: true, comment: 'Loved it' });
    });

    it('updates the feedback given on an earlier run', async () => {
        feedbacks.items = [{ id: 'fbk-1', user: 'usr-1', activity: 'act-1', liked: true, comment: '' } as FeedbackData];
        const { subject } = await setup();

        await subject.toggleLike();

        expect(feedbacks.items).toEqual([expect.objectContaining({ id: 'fbk-1', liked: false })]);
    });

    it('stays on the screen when the comment is refused, so it is not lost', async () => {
        const { subject, router } = await setup();
        feedbacks.failNextWith({ comment: { code: 'validation_max_text_constraint' } });

        subject.comment.value = 'Loved it';
        await subject.leave();
        await flushPromises();

        expect(router.currentRoute.value.name).toBe(routesNames.feedback);
    });
});
