import { createSearchFilter, SortDirection, type Paginated } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import type { MaterialData } from '@features/activities/model/material';
import { materialsApi as materials } from '@features/admin/catalogue-authoring/api/materials.api';
import { renamedTo } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

// One of <Pagination>'s page sizes, or its selector shows blank.
const DEFAULT_PER_PAGE = 25;

/**
 * The catalogue's screen: its page, its search, and adding, renaming and deleting a material.
 * Each is a write of its own; there is no form to save.
 */
export function useMaterialsEditList() {
    const paginated = ref<Paginated<MaterialData>>({
        items: [],
        total: 0,
        options: { page: 1, perPage: DEFAULT_PER_PAGE, sortBy: 'name', sortDirection: SortDirection.ASC },
    });
    const search = ref('');

    const alert = useAlert();
    const { t } = useI18n();

    /** The names the catalogue holds, by id — what a refused rename goes back to. */
    let saved = new Map<string, string>();

    /** Re-query the current page. */
    async function refresh() {
        paginated.value = await materials.filter(
            createSearchFilter(search.value, ['name']),
            paginated.value.options,
        );
        saved = new Map(paginated.value.items.map(material => [material.id, material.name]));
    }

    /** Add the searched name to the catalogue. A name it already has is refused, and stays typed. */
    async function createMaterial() {
        try {
            await materials.create({ name: search.value.trim() } as MaterialData);
        } catch {
            alert.error(t('catalogue.materials.createRefused'));
            return;
        }

        search.value = '';
        alert.success(t('catalogue.materials.created'));
        await refresh();
    }

    /**
     * Write a material's name, as its field is left. A blank or unchanged field writes nothing
     * and shows the saved name again; a refusal — a name already taken — does the same, so the
     * list never shows a name the catalogue does not hold.
     */
    async function renameMaterial(material: MaterialData) {
        const previous = saved.get(material.id) ?? material.name;
        const next = renamedTo(previous, material.name);
        if (!next) {
            material.name = previous;
            return;
        }

        try {
            await materials.update(material.id, { name: next });
            material.name = next;
            saved.set(material.id, next);
        } catch {
            material.name = previous;
            alert.error(t('catalogue.materials.renameRefused'));
        }
    }

    /**
     * Delete a material from the catalogue. Every activity listing it loses it, and so do their
     * steps and workshops — the backend's cascade, which the screen warns about before calling.
     */
    async function removeMaterial(material: MaterialData) {
        try {
            await materials.remove(material.id);
        } catch {
            alert.error(t('validation.errors.default'));
            return;
        }

        alert.success(t('catalogue.materials.removed'));
        await refresh();
    }

    onMounted(refresh);

    return {
        paginated,
        search,
        refresh,
        createMaterial,
        renameMaterial,
        removeMaterial,
    };
}
