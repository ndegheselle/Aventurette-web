import { Paginated, PaginationOptions, SortDirection, type BaseEntity, type IDataCrud } from "@chapelure/core";
import type PocketBase from 'pocketbase';
import { createPocketBaseCrud } from "./crud";

export interface ICachedCrud<TResponse extends BaseEntity> extends IDataCrud<TResponse> {
    /** Drop the cache so the next read hits the server again. */
    invalidate(): void;
}

/**
 * A CRUD service that fetches the whole collection once and serves reads from memory.
 * Intended for small reference collections (tags, categories, benefits).
 *
 * Cache state is held per instance, so create one at module scope in a repository and share it.
 * Writes go to the server and are reflected in the cache; `filter` always goes to the server.
 */
export function createPocketBaseCached<TResponse extends BaseEntity>(
    client: PocketBase,
    collectionName: string,
    relations: string[] | undefined = undefined
): ICachedCrud<TResponse> {

    const crud = createPocketBaseCrud<TResponse>(client, collectionName, relations);

    let cache: TResponse[] = [];
    let isLoaded = false;
    let loadPromise: Promise<TResponse[]> | null = null;

    async function ensureLoaded(): Promise<TResponse[]> {
        if (isLoaded) return cache;
        if (loadPromise) return loadPromise;

        loadPromise = crud.getAll().then((items) => {
            cache = items;
            isLoaded = true;
            loadPromise = null;
            return items;
        });

        return loadPromise;
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

        const items = [...allItems];
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
        cache.push(created);
        return created;
    }

    async function update(id: string, data: Partial<TResponse>): Promise<TResponse> {
        const updated = await crud.update(id, data);
        const index = cache.findIndex((i) => i.id === id);
        if (index !== -1) {
            cache[index] = updated;
        }
        return updated;
    }

    async function remove(id: string): Promise<void> {
        await crud.remove(id);
        cache = cache.filter((i) => i.id !== id);
    }

    function invalidate(): void {
        isLoaded = false;
        cache = [];
        loadPromise = null;
    }

    return {
        create,
        update,
        remove,
        getAll,
        getById,
        getList,
        filter: crud.filter,
        invalidate,
    };
}
