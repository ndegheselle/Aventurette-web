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
 * What a list is narrowed by, in two copies: `applied` is what the list shows, `draft` is what
 * the modal's inputs are bound to. Bind the modal's show/cancel/confirm to `openDraft`,
 * `discardDraft` and `applyDraft`.
 *
 * `onApply` fires whenever what the list shows changes, and only then — editing the draft is
 * not a change, confirming it is.
 *
 * @param criteria what can be narrowed by, in the order the form shows them
 * @param onApply re-query with the applied criteria, usually the screen's own `refresh`
 */
export function useFilters(criteria: Criterion[], onApply: () => void) {
    // Both refs below are deep, and a component turned into a reactive proxy warns.
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

    /** Empty the modal's inputs. Does not re-query — the user still confirms. */
    function resetDraft() {
        search.value = '';
        draft.value = clearedCriteria(draft.value);
    }

    /**
     * Drop everything the list is narrowed by — the chip row's clear button. Re-queries, unlike
     * `resetDraft`: there is nothing left to confirm.
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

    /** Fill in what a `tags` criterion offers, once its api call has answered. */
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

/** What a filter bar is handed: the whole state, as one prop. */
export type Filters = ReturnType<typeof useFilters>;
