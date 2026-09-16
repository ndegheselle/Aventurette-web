import { Paginated, PaginationOptions } from '@chapelure/core';
import { activitiesApi as activities, benefitsApi as benefits } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/model/activity';
import {
    activityCriteria,
    BENEFITS_CRITERION,
    buildActivityFilters,
} from '@features/activities/model/activity.filters';
import {
    clearedCriteria,
    cloneCriteria,
    withChoices,
    withoutCriterion,
    type Criterion,
} from '@features/activities/model/criteria';
import { BabyIcon, ClockIcon, MapIcon, TrendingUpIcon } from 'lucide-vue-next';
import { markRaw, onMounted, ref, type Component } from 'vue';

const DEFAULT_PER_PAGE = 5;

/**
 * A criterion, plus the icon that stands for it on its form field and its chip.
 *
 * The icon is hung on here rather than declared with the criterion because `model/` may not
 * import the view layer, and a lucide icon is a Vue component. `markRaw` keeps it out of the
 * reactive graph — a component turned into a reactive proxy is a Vue warning, and warnings
 * fail the suite.
 */
export type ActivityCriterion = Criterion & { icon: Component };

const CRITERION_ICONS: Record<string, Component> = {
    age: BabyIcon,
    duration: ClockIcon,
    environment: MapIcon,
    benefits: TrendingUpIcon,
};

function activityCriteriaWithIcons(): ActivityCriterion[] {
    return activityCriteria().map(criterion => ({
        ...criterion,
        icon: markRaw(CRITERION_ICONS[criterion.key]!),
    }));
}

/**
 * The public activity list: what is on it, and what narrows it.
 *
 * Read-only. Writing an activity — and the button that starts one — is the `activities-edit`
 * feature's, which lists the author's own rather than everybody's.
 *
 * One composable for one screen. The criteria used to live in `<ActivitiesFilters>`, which
 * handed a built `FilterGroup` back up through `v-model` for the page to re-query with — the
 * query made a round trip for no reason. It is built here now, next to the call that sends it,
 * and the component is handed `filters` to render.
 */
export function useActivitiesList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        new Paginated<ActivityData>([], 0, new PaginationOptions(1, perPage)),
    );

    /**
     * Two copies of the criteria, because the advanced filters live in a modal: `applied` is
     * what the list is currently showing, `draft` is what the modal's inputs are bound to.
     * Confirming copies draft over applied; cancelling copies the other way.
     */
    const search = ref('');
    const applied = ref<ActivityCriterion[]>(activityCriteriaWithIcons());
    const draft = ref<ActivityCriterion[]>(activityCriteriaWithIcons());

    /**
     * Re-query with the applied criteria and the current page.
     *
     * Empty criteria build an empty group, which the adapter sends as no filter at all — so the
     * first load and a filtered one take the same path, and there is no separate "unfiltered"
     * branch that could drift from the other.
     */
    async function refresh() {
        paginated.value = await activities.filter(
            buildActivityFilters(applied.value, search.value),
            paginated.value.options,
        );
    }

    /** Seed the modal's inputs from what is currently applied. */
    function openDraft() {
        draft.value = cloneCriteria(applied.value);
    }

    /** Throw the modal's edits away. */
    function discardDraft() {
        draft.value = cloneCriteria(applied.value);
    }

    /** Adopt the modal's edits and re-query. */
    function applyDraft() {
        applied.value = cloneCriteria(draft.value);
        refresh();
    }

    /**
     * Clear the form. Note this does not re-query on its own: it empties the inputs, and the
     * user still confirms — the same as any other edit made in the modal.
     */
    function resetDraft() {
        search.value = '';
        draft.value = clearedCriteria(draft.value);
    }

    /**
     * Drop everything the list is narrowed by — the chip row's clear button.
     *
     * Unlike `resetDraft` this one re-queries: nothing is left to confirm, since it empties what
     * is applied and not just what the modal is showing. Removing a single criterion is the
     * same move, narrowed to one chip's cross.
     */
    function clearApplied() {
        search.value = '';
        applied.value = clearedCriteria(applied.value);
        refresh();
    }

    function removeCriterion(key: string) {
        applied.value = withoutCriterion(applied.value, key);
        refresh();
    }

    onMounted(async () => {
        // The one criterion whose choices are records: they are loaded into both copies, so the
        // modal offers them and a chip can still name what is applied.
        const choices = (await benefits.getAll()).map(benefit => ({ label: benefit.name, value: benefit.id }));
        applied.value = withChoices(applied.value, BENEFITS_CRITERION, choices);
        draft.value = withChoices(draft.value, BENEFITS_CRITERION, choices);

        await refresh();
    });

    return {
        paginated,
        refresh,
        /** Everything `<ActivitiesFilters>` renders, handed down as one object. */
        filters: {
            search,
            applied,
            draft,
            apply: refresh,
            openDraft,
            discardDraft,
            applyDraft,
            resetDraft,
            clearApplied,
            removeCriterion,
        },
    };
}

/** What `<ActivitiesFilters>` is handed. */
export type ActivityFilters = ReturnType<typeof useActivitiesList>['filters'];
