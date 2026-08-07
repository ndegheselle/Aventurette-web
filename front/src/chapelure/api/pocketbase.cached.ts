import { Paginated, PaginationOptions, SortDirection, type BaseEntity } from "@chapelure/core";
import { usePocketBaseCrud, type IPocketBaseCrud } from "@chapelure/api/pocketbase";

export type CachedState<TResponse extends BaseEntity> = {
    cache: TResponse[];
    isLoaded: boolean;
    loadPromise: Promise<TResponse[]> | null;
}

export interface ICachedCrud<TResponse extends BaseEntity> extends IPocketBaseCrud<TResponse>
{
    invalidate(): void;
}

/**
 * A PocketBase CRUD service that caches data locally after the first fetch.
 * Subsequent calls to getAll, getById, and getList will use the local cache to avoid API calls.
 * Mutations (create, update, delete) will update both the server and the local cache.
 */
export function usePocketBaseCached<TResponse extends BaseEntity>(state: CachedState<TResponse>, collectionName: string, expands: string[] | undefined = undefined)
    : ICachedCrud<TResponse> {

    const crud = usePocketBaseCrud<TResponse>(collectionName, expands);

    async function ensureLoaded(): Promise<TResponse[]> {
        if (state.isLoaded) return state.cache;
        if (state.loadPromise) return state.loadPromise;

        state.loadPromise = crud.getAll().then((items) => {
            state.cache = items;
            state.isLoaded = true;
            state.loadPromise = null;
            return items;
        });

        return state.loadPromise;
    }

    async function getAll(): Promise<TResponse[]> {
        return await ensureLoaded();
    }

    async function getById(id: string): Promise<TResponse | null> {
        const items = await ensureLoaded();
        return items.find((i) => i.id === id) || null;
    }

    async function getList(options: PaginationOptions): Promise<Paginated<TResponse>> {
        const allItems = await ensureLoaded();

        let items = [...allItems];
        if (options.sortBy) {
            const dir = options.sortDirection === SortDirection.DESC ? -1 : 1;
            items.sort((a: any, b: any) => {
                const valA = a[options.sortBy!];
                const valB = b[options.sortBy!];
                if (valA < valB) return -1 * dir;
                if (valA > valB) return 1 * dir;
                return 0;
            });
        }

        const start = (options.page - 1) * options.perPage;
        const paged = items.slice(start, start + options.perPage);

        return new Paginated<TResponse>(paged, items.length, options);
    }

    async function create(data: TResponse): Promise<TResponse> {
        const created = await crud.create(data);
        state.cache.push(created);
        return created;
    }

    async function update(id: string, data: Partial<TResponse>): Promise<TResponse> {
        const updated = await crud.update(id, data);
        const index = state.cache.findIndex((i) => i.id === id);
        if (index !== -1) {
            state.cache[index] = updated;
        }
        return updated;
    }

    async function remove(id: string): Promise<void> {
        await crud.remove(id);
        state.cache = state.cache.filter((i) => i.id !== id);
    }

    function invalidate(): void {
        state.isLoaded = false;
        state.cache = [];
        state.loadPromise = null;
    }

    return {
        create,
        update,
        remove,
        getAll,
        getById,
        getList,
        filter: crud.filter,
        collection: crud.collection,
        pb: crud.pb,
        invalidate,
    }
}