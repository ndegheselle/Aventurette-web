import { createSearchFilter, SortDirection, type FilterGroup, type IDataCrud, type Paginated } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import type { SafetyInstructionData, ActivityTipData } from '@features/activities/model/activity';
import type { ActivityTagData, ActivityTagType } from '@features/activities/model/tag';
import { safetyInstructionsApi } from '@features/admin/catalogue-authoring/api/safety.api';
import { tagsApi } from '@features/admin/catalogue-authoring/api/tags.api';
import { tipsApi } from '@features/admin/catalogue-authoring/api/tips.api';
import { tagsFilter } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

// One of <Pagination>'s page sizes, or its selector shows blank.
const DEFAULT_PER_PAGE = 25;

/**
 * A catalogue's tab: its page sorted by name, its search, and the delete button. Adding and
 * editing go through the tab's modal, which writes the entry itself; the tab re-queries after.
 *
 * @param crud the catalogue
 * @param filterOf what the search asks for
 * @param onRefreshed called with every page read, as soon as it is the one shown
 */
export function useCatalogueEditList<T extends { id: string, name: string }>(
    crud: IDataCrud<T>,
    filterOf: (search: string) => FilterGroup<T>,
    onRefreshed?: (items: T[]) => void,
) {
    const paginated = ref<Paginated<T>>({
        items: [],
        total: 0,
        options: { page: 1, perPage: DEFAULT_PER_PAGE, sortBy: 'name', sortDirection: SortDirection.ASC },
    });
    const search = ref('');

    const alert = useAlert();
    const { t } = useI18n();

    /** Re-query the current page. */
    async function refresh() {
        const page = await crud.filter(filterOf(search.value), paginated.value.options);
        paginated.value = page as Paginated<T>;
        onRefreshed?.(page.items);
    }

    /**
     * Delete an entry. The backend unlinks it from every activity using it, which the screen
     * warns about before calling.
     */
    async function remove(entry: T) {
        try {
            await crud.remove(entry.id);
        } catch {
            alert.error(t('validation.errors.default'));
            return;
        }

        alert.success(t('catalogue.removed'));
        await refresh();
    }

    onMounted(refresh);

    return { paginated, search, refresh, remove };
}

/** The tags tab, narrowed to one kind unless `type` is `null`. */
export function useTagsEditList() {
    const type = ref<ActivityTagType | null>(null);
    const list = useCatalogueEditList<ActivityTagData>(tagsApi, search => tagsFilter(search, type.value));

    /** Switch kind, back to the first page. */
    async function selectType(next: ActivityTagType | null) {
        type.value = next;
        list.paginated.value.options.page = 1;
        await list.refresh();
    }

    return { ...list, type, selectType };
}

/** The safety instructions tab. */
export function useSafetyInstructionsEditList() {
    return useCatalogueEditList<SafetyInstructionData>(
        safetyInstructionsApi,
        search => createSearchFilter(search, ['name', 'slug']),
    );
}

/** The tips tab. */
export function useTipsEditList() {
    return useCatalogueEditList<ActivityTipData>(tipsApi, search => createSearchFilter(search, ['name']));
}
