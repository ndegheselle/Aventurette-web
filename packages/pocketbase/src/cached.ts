import { type Paginated, type PaginationOptions, SortDirection, type BaseEntity, type EntityMapper, type IDataCrud } from "@chapelure/core";
import type PocketBase from 'pocketbase';
import { createPocketBaseCrud } from "./crud";

export interface ICachedCrud<TEntity extends BaseEntity> extends IDataCrud<TEntity> {
    /** Drop the cache so the next read hits the server again. */
    invalidate(): void;
}

/**
 * A CRUD service that fetches the whole collection once and serves reads from memory. Only for
 * small reference collections (tags, categories, benefits).
 *
 * The cache is per instance — create one at module scope so callers share it. Writes go to the
 * server and update the cache; `filter` always goes to the server.
 */
export function createPocketBaseCached<TPayload extends BaseEntity, TEntity extends BaseEntity>(
    client: PocketBase,
    collectionName: string,
    mapper: EntityMapper<TPayload, TEntity>
): ICachedCrud<TEntity> {

    const crud = createPocketBaseCrud<TPayload, TEntity>(client, collectionName, mapper);

    let cache: TEntity[] = [];
    let isLoaded = false;
    let loadPromise: Promise<TEntity[]> | null = null;

    async function ensureLoaded(): Promise<TEntity[]> {
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

    async function getAll(): Promise<TEntity[]> {
        return await ensureLoaded();
    }

    async function getById(id: string): Promise<TEntity | null> {
        const items = await ensureLoaded();
        return items.find((i) => i.id === id) || null;
    }

    async function getList(options: PaginationOptions): Promise<Paginated<TEntity>> {
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

        return { items: paged, total: items.length, options };
    }

    async function create(data: TEntity): Promise<TEntity> {
        const created = await crud.create(data);
        cache.push(created);
        return created;
    }

    async function update(id: string, data: Partial<TEntity>): Promise<TEntity> {
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
