import type { Paginated } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { createEmptyActivity, type ActivityData } from '@features/activities/model/activity';
import {
    buildAuthoredFilters,
    type ActivityStateFilter,
} from '@features/activities-authoring/model/activity.edit';
import { routesNames } from '@features/activities-authoring/routes';
import { useAuth } from '@features/auth/composables/useAuth';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const DEFAULT_PER_PAGE = 10;
export function useActivitiesEditList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        { items: [], total: 0, options: { page: 1, perPage } },
    );

    /** `null` is the "all" tab. See `authoredStateTabs`. */
    const state = ref<ActivityStateFilter>(null);

    const router = useRouter();
    const alert = useAlert();
    const { t } = useI18n();
    const { currentId } = useAuth();

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
     * Start a new activity: write the record, then open the editor on it. Everything after this
     * is an update — which is what lets a step, and the files under it, be saved as they are
     * added, each needing a parent that already exists.
     */
    const { isLoading: isCreating, submit: createActivity } = useSubmit(async () => {
        const created = await activities.create({
            ...createEmptyActivity(),
            name: t('activities.untitled'),
            user: currentId(),
        });

        router.push({ name: routesNames.page, params: { id: created.id } });
    });

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

        alert.success(t('activities.edit.removed'));
        await refresh();
    }

    onMounted(refresh);

    return {
        paginated,
        state,
        refresh,
        selectState,
        isCreating,
        createActivity,
        removeActivity,
    };
}
