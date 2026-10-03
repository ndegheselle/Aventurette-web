import type { BaseEntity, IDataCrud } from '@chapelure/core';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import type { IModalController } from '@chapelure/ui/modals/useModal';
import { slugFollowing } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { watch } from 'vue';

/**
 * The modal of a catalogue entry with a slug, a tag or a safety instruction: `useEditModal`, and
 * a new entry's slug following its name as `slugFollowing` says.
 */
export function useSluggedEditModal<T extends BaseEntity & { name: string, slug: string }>(
    controller: IModalController<T>,
    crud: IDataCrud<T>,
) {
    const modal = useEditModal(controller, crud);

    watch(() => modal.data.value.name, (name, previous) => {
        if (!modal.isNew.value) return;

        const entry = modal.data.value;
        entry.slug = slugFollowing(entry.slug ?? '', previous ?? '', name ?? '');
    });

    return modal;
}
