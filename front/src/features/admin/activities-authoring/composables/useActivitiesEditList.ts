import type { Paginated } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/model/activity';
import {
    buildAuthoredFilters,
    type ActivityStateFilter,
} from '@features/admin/activities-authoring/model/activity.edit';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const DEFAULT_PER_PAGE = 10;

/**
 * The author's list: its state tabs, its page, and the delete button. Adding is a link to the
 * editor, which writes nothing until its first save.
 */
export function useActivitiesEditList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        { items: [], total: 0, options: { page: 1, perPage } },
    );

    /** `null` is the "all" tab. See `authoredStateTabs`. */
    const state = ref<ActivityStateFilter>(null);

    const alert = useAlert();
    const { t } = useI18n();

    /** Re-query for the current tab and page. */
    async function refresh() {
        paginated.value = await activities.filter(
            buildAuthoredFilters(state.value),
            paginated.value.options,
        );
    }

    /** Switch tab, back to the first page: page 3 of the drafts is page 3 of nothing else. */
    async function selectState(next: ActivityStateFilter) {
        state.value = next;
        paginated.value.options.page = 1;
        await refresh();
    }

    /**
     * Delete an activity outright — no unlinking first, unlike a step. `activities_steps.activity`
     * cascades, so the steps go with it, and their materials and resources with them.
     *
     * Re-queried rather than filtered in place: what refills the page has not been returned yet.
     */
    async function removeActivity(activity: ActivityData) {
        try {
            await activities.remove(activity.id);
        } catch {
            alert.error(t('validation.errors.default'));
            return;
        }

        alert.success(t('activities.authoring.removed'));
        await refresh();
    }

    onMounted(refresh);

    return {
        paginated,
        state,
        refresh,
        selectState,
        removeActivity,
    };
}
