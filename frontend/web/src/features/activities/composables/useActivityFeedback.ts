import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { feedbackApi as feedbacks } from '@features/activities/api/feedback.api';
import { useActivity } from '@features/activities/composables/useActivity';
import { returnToActivity } from '@features/activities/composables/useActivityPlay';
import { commentToSave, createFeedback, feedbackFilter, type FeedbackData } from '@features/activities/models/feedback';
import { useAuth } from '@features/user/composables/useAuth';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

/**
 * The screen after a run: what the user thought of the activity. A like is written the moment
 * it is toggled; the comment as the user leaves, if it changed. The favourite is the shared
 * heart's, which writes itself.
 */
export function useActivityFeedback() {
    const { activity } = useActivity();
    const { currentId } = useAuth();
    const alert = useAlert();
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    /** The feedback the backend holds; null until the user first gives one. */
    const feedback = ref<FeedbackData | null>(null);
    const comment = ref('');
    /** Held until the feedback is read, so a first tap cannot create a second one. */
    const isBusy = ref(true);

    watch(
        () => route.params.id,
        async (id) => {
            if (typeof id !== 'string') return;
            const found = await feedbacks.filter(feedbackFilter(currentId(), id), { page: 1, perPage: 1 });
            feedback.value = found.items[0] ?? null;
            comment.value = feedback.value?.comment ?? '';
            isBusy.value = false;
        },
        { immediate: true },
    );

    /**
     * Run a write with the buttons held, so a second tap cannot race the first. A refusal is
     * shown rather than thrown, and resolves to false.
     */
    async function guarded(write: () => Promise<void>): Promise<boolean> {
        isBusy.value = true;
        try {
            await write();
            return true;
        } catch {
            alert.error(t('activities.feedback.saveRefused'));
            return false;
        } finally {
            isBusy.value = false;
        }
    }

    /**
     * Write onto the user's feedback, creating it the first time: the backend holds one per
     * user and activity, so every write after the first has to be an update.
     */
    async function save(activityId: string, changes: Partial<Pick<FeedbackData, 'liked' | 'comment'>>) {
        feedback.value = feedback.value
            ? await feedbacks.update(feedback.value.id, changes)
            : await feedbacks.create({ ...createFeedback(currentId(), activityId), ...changes });
    }

    const liked = computed(() => feedback.value?.liked ?? false);

    async function toggleLike() {
        const current = activity.value;
        if (!current) return;
        await guarded(() => save(current.id, { liked: !liked.value }));
    }

    /** Back to the activity, once the comment is saved: a refused one keeps the user here. */
    async function leave() {
        const current = activity.value;
        if (!current) return;

        const changed = commentToSave(feedback.value?.comment ?? '', comment.value);
        if (changed !== null) {
            const saved = await guarded(() => save(current.id, { comment: changed }));
            if (!saved) return;
        }

        returnToActivity(router, current.id);
    }

    return { activity, liked, comment, isBusy, toggleLike, leave };
}
