import { useModal } from '@chapelure/ui/modals/useModal';
import {
    activeFilterCount,
    copyOf,
    emptyCatalogueFilters,
    isProfileEmpty,
    matchesProfile,
    withoutProfile,
    withProfile,
    type CatalogueFilters,
    type QuickFilter,
} from '@features/activities/models/catalogueFilters';
import { useFilterDefaults } from '@features/user/composables/useFilterDefaults';
import { computed, ref, watch } from 'vue';

/**
 * The catalogue's search and filters. `search` is what is typed, `searched` what the list is
 * searched for: the search input says when typing has settled. The filters start from the user's
 * profile once it is read. Each sheet edits a draft: applying it replaces what is applied,
 * closing it any other way drops it.
 */
export function useCatalogueFilters() {
    const search = ref('');
    const searched = ref('');
    const searchFor = (value: string) => { searched.value = value; };
    const applied = ref<CatalogueFilters>(emptyCatalogueFilters());
    const draft = ref<CatalogueFilters>(emptyCatalogueFilters());

    const { defaults } = useFilterDefaults();
    watch(defaults, (read) => {
        if (read) applied.value = withProfile(applied.value, read);
    }, { once: true });

    const allSheet = useModal();
    const quickSheet = useModal();
    const quickShown = ref<QuickFilter | null>(null);

    async function edit(sheet: typeof allSheet) {
        draft.value = copyOf(applied.value);
        if (await sheet.show()) applied.value = draft.value;
    }

    const openAll = () => edit(allSheet);

    async function openQuick(quick: QuickFilter) {
        quickShown.value = quick;
        await edit(quickSheet);
    }

    function reset() {
        draft.value = emptyCatalogueFilters();
    }

    const activeCount = computed(() => activeFilterCount(applied.value));
    const draftCount = computed(() => activeFilterCount(draft.value));

    const hasProfile = computed(() => !isProfileEmpty(defaults.value));
    const profileApplied = computed({
        get: () => matchesProfile(draft.value, defaults.value),
        set: (on) => {
            if (!defaults.value) return;
            draft.value = on ? withProfile(draft.value, defaults.value) : withoutProfile(draft.value);
        },
    });

    return {
        search, searched, searchFor, applied, draft, activeCount, draftCount,
        allSheet, quickSheet, quickShown, openAll, openQuick, reset,
        hasProfile, profileApplied,
    };
}
