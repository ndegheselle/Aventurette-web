import { Paginated, PaginationOptions, type BaseEntity, type FilterGroup, type IDataCrud } from "@chapelure/core";
import type PocketBase from 'pocketbase';
import { mapErrors } from "./errors";
import { filterGroupToPocketBase } from "./filters";

/**
 * IDataCrud backed by one PocketBase collection.
 *
 * Note the return type: only the port is handed back. The underlying RecordService and client
 * stay closed over here on purpose, so no caller can reach around the seam.
 *
 * @param relations records to expand alongside each entity
 */
export function createPocketBaseCrud<TResponse extends BaseEntity>(
    client: PocketBase,
    collectionName: string,
    relations: string[] | undefined = undefined
): IDataCrud<TResponse> {
    const collection = client.collection(collectionName);
    const expand = relations?.join(",");

    function sort(options: PaginationOptions): string | undefined {
        return options.sortBy ? `${options.sortDirection}${options.sortBy}` : undefined;
    }

    async function create(data: TResponse): Promise<TResponse> {
        return await mapErrors(() => collection.create<TResponse>(data, { expand }));
    }

    async function update(id: string, data: Partial<TResponse>): Promise<TResponse> {
        return await mapErrors(() => collection.update<TResponse>(id, data, { expand }));
    }

    async function remove(id: string): Promise<void> {
        await mapErrors(() => collection.delete(id));
    }

    async function getById(id: string): Promise<TResponse | null> {
        return await mapErrors(() => collection.getOne<TResponse>(id, { expand }));
    }

    async function getAll(): Promise<TResponse[]> {
        return await mapErrors(() => collection.getFullList<TResponse>({ expand }));
    }

    async function getList(options: PaginationOptions): Promise<Paginated<TResponse>> {
        const result = await mapErrors(() => collection.getList<TResponse>(options.page, options.perPage, {
            expand,
            sort: sort(options),
        }));

        return new Paginated<TResponse>(result.items, result.totalItems, options);
    }

    async function filter(group: FilterGroup<TResponse>, options: PaginationOptions): Promise<Paginated<TResponse>> {
        const expression = filterGroupToPocketBase(group);
        const result = await mapErrors(() => collection.getList<TResponse>(options.page, options.perPage, {
            expand,
            sort: sort(options),
            filter: expression || undefined,
        }));

        return new Paginated<TResponse>(result.items, result.totalItems, options);
    }

    return { create, update, remove, getAll, getById, getList, filter };
}
