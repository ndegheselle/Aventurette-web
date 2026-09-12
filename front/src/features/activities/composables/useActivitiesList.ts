import { Paginated, PaginationOptions } from '@chapelure/core';
import { useSubmit } from '@chapelure/ui/composables/useSubmit';
import { activitiesApi as activities, benefitsApi as benefits } from '@features/activities/api/activities.api';
import { createEmptyActivity, type ActivityData, type BenefitData } from '@features/activities/model/activity';
import {
    buildActivityFilters,
    emptyCriteria,
    hasAdvancedCriteria,
    type ActivityCriteria,
} from '@features/activities/model/activity.filters';
import { routesNames } from '@features/activities/routes';
import { useAuth } from '@features/auth/composables/useAuth';
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const DEFAULT_PER_PAGE = 5;

/**
 * The activity list screen: what is on it, what narrows it, and the button that starts a new
 * one.
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
     * Confirming copies draft over applied; cancelling copies the other way. Without the split,
     * typing in the modal and then cancelling would still have re-queried the list.
     *
     * Search is the exception — it is outside the modal and applies as soon as it is submitted.
     */
    const search = ref('');
    const applied = reactive<ActivityCriteria>(emptyCriteria());
    const draft = reactive<ActivityCriteria>(emptyCriteria());

    const availableBenefits = ref<BenefitData[]>([]);
    const showsAdvancedBadge = computed(() => hasAdvancedCriteria(applied));

    /** TagSelect works in records; the criteria hold ids. This is the translation between them. */
    const draftBenefits = computed({
        get: () => availableBenefits.value.filter(b => draft.benefits.includes(b.id)),
        set: (items: BenefitData[]) => {
            draft.benefits = Array.isArray(items) ? items.map(i => i.id) : [];
        },
    });

    /**
     * Re-query with the applied criteria and the current page.
     *
     * Empty criteria build an empty group, which the adapter sends as no filter at all — so the
     * first load and a filtered one take the same path, and there is no separate "unfiltered"
     * branch that could drift from the other.
     */
    async function refresh() {
        paginated.value = await activities.filter(
            buildActivityFilters(applied, search.value),
            paginated.value.options,
        );
    }

    /** Seed the modal's inputs from what is currently applied. */
    function openDraft() {
        Object.assign(draft, applied);
    }

    /** Throw the modal's edits away. */
    function discardDraft() {
        Object.assign(draft, applied);
    }

    /** Adopt the modal's edits and re-query. */
    function applyDraft() {
        Object.assign(applied, draft);
        refresh();
    }

    /**
     * Clear the form. Note this does not re-query on its own: it empties the inputs, and the
     * user still confirms — the same as any other edit made in the modal.
     */
    function resetDraft() {
        search.value = '';
        Object.assign(draft, emptyCriteria());
    }

    const router = useRouter();
    const { t } = useI18n();
    const { currentId } = useAuth();

    /**
     * Starting a new activity.
     *
     * The record is written before the editor opens, empty but for what the collection
     * requires, and everything after that is an update. That is what lets a step and the files
     * under it be saved the moment they are added: each of them is a record of its own, and a
     * record needs a parent that already exists to belong to.
     */
    const { isLoading: isCreating, submit: createActivity } = useSubmit(async () => {
        const created = await activities.create({
            ...createEmptyActivity(),
            name: t('activities.untitled'),
            user: currentId(),
        });

        router.push({ name: routesNames.edit, params: { id: created.id } });
    });

    onMounted(async () => {
        availableBenefits.value = await benefits.getAll();
        await refresh();
    });

    return {
        paginated,
        refresh,
        isCreating,
        createActivity,
        /** Everything `<ActivitiesFilters>` renders, handed down as one object. */
        filters: {
            search,
            applied,
            draft,
            availableBenefits,
            draftBenefits,
            showsAdvancedBadge,
            apply: refresh,
            openDraft,
            discardDraft,
            applyDraft,
            resetDraft,
        },
    };
}

/** What `<ActivitiesFilters>` is handed. */
export type ActivityFilters = ReturnType<typeof useActivitiesList>['filters'];
