import { useConfirmation } from '@common/composables/popups/confirmation';
import type { PaginationOptions } from '@common/database/crud';
import { type IDataCrud } from '@common/database/crud';
import type { BaseSystemFields } from '@common/database/types.g';
import { ref } from 'vue';

export function usePageActions<T extends BaseSystemFields>(data: IDataCrud<T>, editCallback: ((element: T) => Promise<boolean> | undefined) | undefined = undefined)
{
    const confirmation = useConfirmation();
    const list = ref<T[]>([]);
    const total = ref<number>(0);

    let _pagination: PaginationOptions = { page: 1, perPage: 25 };
    let _search = '';

    async function remove(element: T) {
        const confirmed = await confirmation.show(
            'Confirmer la suppression',
            `Êtes-vous sûr de vouloir supprimer cet élément ?`,
            'fa-solid fa-triangle-exclamation text-warning');

        if (!confirmed) {
            return;
        }

        await data.delete(element.id);
        refresh(_search, _pagination);
    }

    async function create() {
        return await edit({} as T);
    }

    async function edit(element: T) {
        if (editCallback == undefined) 
            return;
        if (await editCallback(element) == true)
            refresh(_search, _pagination);
    }

    async function refresh(search: string, pagination: PaginationOptions) {
        _search = search;
        _pagination = pagination;

        const result = await data.search(search, pagination);
        list.value = result.data || [];
        total.value = result.total || 0;
    }

    return {
        list,
        total,
        remove,
        create,
        edit,
        refresh
    };
}