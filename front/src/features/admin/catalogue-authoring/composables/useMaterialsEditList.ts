import { createSearchFilter } from '@chapelure/core';
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import type { MaterialData } from '@features/activities/model/material';
import { materialsApi as materials } from '@features/admin/catalogue-authoring/api/materials.api';
import { useCatalogueEditList } from '@features/admin/catalogue-authoring/composables/useCatalogueEditList';
import { renamedTo } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { useI18n } from 'vue-i18n';

/**
 * The materials tab: a catalogue tab with no modal, since a material is only a name. Adding
 * takes the searched name, and renaming is written as a row's field is left.
 */
export function useMaterialsEditList() {
    /** The names the catalogue holds, by id — what a refused rename goes back to. */
    let saved = new Map<string, string>();

    const list = useCatalogueEditList<MaterialData>(
        materials,
        search => createSearchFilter(search, ['name']),
        items => { saved = new Map(items.map(material => [material.id, material.name])); },
    );
    const { search, refresh } = list;

    const alert = useAlert();
    const { t } = useI18n();

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
     * Write a material's name, as its field is left, and set the row to the name the catalogue
     * then holds. A blank or unchanged field writes nothing and shows the saved name again; a
     * refusal — a name already taken — does the same, so the list never shows a name the
     * catalogue does not hold.
     *
     * @param typed what the row's field holds
     */
    async function renameMaterial(id: string, typed: string) {
        const row = list.paginated.value.items.find(material => material.id === id);
        if (!row) return;

        const previous = saved.get(id) ?? typed;
        const next = renamedTo(previous, typed);
        if (!next) {
            row.name = previous;
            return;
        }

        try {
            await materials.update(id, { name: next });
            row.name = next;
            saved.set(id, next);
        } catch {
            row.name = previous;
            alert.error(t('catalogue.materials.renameRefused'));
        }
    }

    return { ...list, createMaterial, renameMaterial };
}
