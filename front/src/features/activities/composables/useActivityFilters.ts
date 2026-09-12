import type { FilterGroup } from '@chapelure/core';
import { benefitsApi as benefits } from '@features/activities/api/benefits.api';
import type { ActivityData } from '@features/activities/model/activity';
import type { BenefitData } from '@features/activities/model/benefit';
import {
    buildActivityFilters,
    emptyCriteria,
    hasAdvancedCriteria,
    type ActivityCriteria,
} from '@features/activities/model/filters';
import { computed, onMounted, reactive, ref } from 'vue';

/**
 * The activity filter toolbar's state.
 *
 * Two copies of the criteria, because the advanced filters live in a modal: `applied` is what
 * the list is currently showing, `draft` is what the modal's inputs are bound to. Confirming
 * copies draft over applied; cancelling copies the other way. Without the split, typing in the
 * modal and then cancelling would still have re-queried the list.
 *
 * Search is the exception — it is outside the modal and applies as soon as it is submitted.
 *
 * @param onChange called with the new query whenever the applied criteria change
 */
export function useActivityFilters(onChange: (group: FilterGroup<ActivityData>) => void) {
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

    function apply() {
        onChange(buildActivityFilters(applied, search.value));
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
        apply();
    }

    /**
     * Clear the form. Note this does not re-query on its own: it empties the inputs, and the
     * user still confirms — the same as any other edit made in the modal.
     */
    function resetDraft() {
        search.value = '';
        Object.assign(draft, emptyCriteria());
    }

    onMounted(async () => {
        availableBenefits.value = await benefits.getAll();
    });

    return {
        search,
        applied,
        draft,
        availableBenefits,
        draftBenefits,
        showsAdvancedBadge,
        apply,
        openDraft,
        discardDraft,
        applyDraft,
        resetDraft,
    };
}
