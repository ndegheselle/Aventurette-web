import { type BaseEntity, type FilterGroup, type IDataCrud, Paginated, PaginationOptions } from "@chapelure/core";
import { filterGroupToPocketBase } from "@chapelure/api/pocketbase.filters";
import type { TypedPocketBase } from '@shared/types.g.ts';
import PocketBase, { RecordService } from 'pocketbase';

let pb: TypedPocketBase | null;
export function initDatabase(url: string) {
    if (!pb) {
        pb = new PocketBase(url) as TypedPocketBase;
    }
}

export function usePocketBase() {
    function getPb(): TypedPocketBase {
        if (!pb)
            throw new Error("PocketBase is not initialized. Call init(url) first.");
        return pb;
    }

    return {
        pb: getPb(),
    }
}

export interface IPocketBaseCrud<TResponse extends BaseEntity> extends IDataCrud<TResponse>
{
    collection: RecordService<TResponse>;
    pb: TypedPocketBase;
}


export function usePocketBaseCrud<TResponse extends BaseEntity>(collectionName: string,  expands: string[] | undefined = undefined) : IPocketBaseCrud<TResponse>
{
    const { pb } = usePocketBase();
    const collection = pb.collection(collectionName);

    async function create(data: TResponse): Promise<TResponse> {
        return await collection.create<TResponse>(data, { expand: expands?.join(",") });
    }

    async function update(id: string, data: Partial<TResponse>): Promise<TResponse> {
        return await collection.update<TResponse>(id, data, { expand: expands?.join(",") });
    }

    async function remove(id: string): Promise<void> {
        await collection.delete(id);
    }

    async function getById(id: string): Promise<TResponse | null> {
        return await collection.getOne<TResponse>(id, { expand: expands?.join(",") });
    }

    async function getAll(): Promise<TResponse[]> {
        return await collection.getFullList<TResponse>({
            expand: expands?.join(",")
        });
    }

    async function getList(options: PaginationOptions): Promise<Paginated<TResponse>> {
        const result = await collection.getList<TResponse>(options.page, options.perPage, {
            expand: expands?.join(","),
            sort: options.sortBy ? `${options.sortDirection}${options.sortBy}` : undefined,
        });

        return new Paginated<TResponse>(result.items, result.totalItems, options);
    }

    async function filter(group: FilterGroup<TResponse>, options: PaginationOptions): Promise<Paginated<TResponse>> {
        const filter = filterGroupToPocketBase(group);
        const result = await collection.getList<TResponse>(options.page, options.perPage, {
            expand: expands?.join(","),
            sort: options.sortBy ? `${options.sortDirection}${options.sortBy}` : undefined,
            filter: filter || undefined,
        });
        return new Paginated<TResponse>(result.items, result.totalItems, options);
    }

    return {
        create,
        update,
        remove,
        getAll,
        getById,
        getList,
        filter,
        collection,
        pb
    }
}