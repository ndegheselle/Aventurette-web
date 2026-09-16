import {
    clearedCriteria,
    cloneCriteria,
    withChoices,
    withoutCriterion,
    type Criterion,
    type CriterionChoice,
} from '@chapelure/ui/filter/criteria';
import { markRaw, ref } from 'vue';

/**
 * What a list is narrowed by, and what the modal editing it is holding.
 *
 * Two copies of the criteria, because the filters live behind a modal: `applied` is what the
 * list is showing, `draft` is what the modal's inputs are bound to. Opening copies applied →
 * draft, confirming copies draft → applied, cancelling copies applied → draft again. Without
 * the split, typing in the modal and then cancelling would still have re-queried.
 *
 * `onApply` is called whenever what the list is showing changes — and only then. Editing the
 * draft is not a change; confirming it is.
 *
 * @param criteria what can be narrowed by, in the order the form shows them.
 * @param onApply re-query with the applied criteria, usually the screen's own `refresh`.
 */
export function useFilters(criteria: Criterion[], onApply: () => void) {
    // Icons are components, and both refs below are deep: one turned into a reactive proxy is a
    // Vue warning. `markRaw` is what keeps them out of the reactive graph.
    const declared = criteria.map(criterion => criterion.icon
        ? { ...criterion, icon: markRaw(criterion.icon) }
        : criterion);

    const search = ref('');
    const applied = ref<Criterion[]>(declared);
    const draft = ref<Criterion[]>(cloneCriteria(declared));

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
        onApply();
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
     * is applied and not just what the modal is showing. Removing one criterion is the same
     * move, narrowed to a single chip's cross.
     */
    function clearApplied() {
        search.value = '';
        applied.value = clearedCriteria(applied.value);
        onApply();
    }

    function removeCriterion(key: string) {
        applied.value = withoutCriterion(applied.value, key);
        onApply();
    }

    /**
     * Fill in what a `tags` criterion offers, once whatever loads it has answered.
     *
     * Both copies are given the same choices — the modal has to offer them, and a chip has to
     * be able to name what is already applied.
     */
    function setChoices(key: string, choices: CriterionChoice[]) {
        applied.value = withChoices(applied.value, key, choices);
        draft.value = withChoices(draft.value, key, choices);
    }

    return {
        search,
        applied,
        draft,
        /** Re-query without touching the criteria — what submitting the search box does. */
        apply: onApply,
        openDraft,
        discardDraft,
        applyDraft,
        resetDraft,
        clearApplied,
        removeCriterion,
        setChoices,
    };
}

/** What a filter bar is handed: the whole state, as one object. */
export type Filters = ReturnType<typeof useFilters>;
