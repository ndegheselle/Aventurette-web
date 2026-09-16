import { Paginated, PaginationOptions } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/composables/useAlert';
import { useSubmit } from '@chapelure/ui/composables/useSubmit';
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
        new Paginated<ActivityData>([], 0, new PaginationOptions(1, perPage)),
    );

    /** `null` is the "all" tab. See `authoredStateTabs`. */
    const state = ref<ActivityStateFilter>(null);

    const router = useRouter();
    const alert = useAlert();
    const { t } = useI18n();
    const { currentId } = useAuth();

    /**
     * Re-query for the current tab and page.
     *
     * `currentId` throws rather than returning nothing when there is no session, which is what
     * keeps an unscoped query — every author's activities, with a delete button beside each —
     * from being the failure mode of signing out. The route is behind the guard anyway.
     */
    async function refresh() {
        paginated.value = await activities.filter(
            buildAuthoredFilters(state.value),
            paginated.value.options,
        );
    }

    /** Switch tab, back to the first page: page 3 of the drafts is not page 3 of anything else. */
    async function selectState(next: ActivityStateFilter) {
        state.value = next;
        paginated.value.options.page = 1;
        await refresh();
    }

    /**
     * Starting a new activity.
     *
     * The record is written before the editor opens, empty but for what the collection
     * requires, and everything after that is an update. That is what lets a step and the files
     * under it be saved the moment they are added: each is a record of its own, and a record
     * needs a parent that already exists to belong to.
     *
     * This used to sit on the public list. It belongs here: that screen is for reading, and an
     * activity is written by the person whose list this is.
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
     * Delete an activity outright — no unlinking first, unlike a step.
     *
     * `activities_steps.activity` cascades, so the steps go with it, and their materials and
     * resources go with the steps. The direction that makes deleting a *step* delicate is the
     * other relation, `activities.steps`, which no longer cascades at all.
     *
     * The list is re-queried rather than filtered in place, because what refills the page is a
     * record the query has not returned yet.
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
