import { Paginated, PaginationOptions, type BaseEntity, type FilterGroup, type IDataCrud } from "@chapelure/core";
import type PocketBase from 'pocketbase';
import { mapErrors } from "./errors";
import { filterGroupToPocketBase } from "./filters";
import { inlineRelations, relationFields, relationsToIds } from "./relations";

/**
 * IDataCrud backed by one PocketBase collection.
 *
 * Note the return type: only the port is handed back. The underlying RecordService and client
 * stay closed over here on purpose, so no caller can reach around the seam.
 *
 * Expanded relations are inlined into the record on the way out and turned back into ids on
 * the way in, so TResponse describes the same shape in both directions — see ./relations.
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
    const fields = relationFields(relations);

    function sort(options: PaginationOptions): string | undefined {
        return options.sortBy ? `${options.sortDirection}${options.sortBy}` : undefined;
    }

    function inline(record: unknown): TResponse {
        return inlineRelations<TResponse>(record);
    }

    async function create(data: TResponse): Promise<TResponse> {
        return inline(await mapErrors(() => collection.create(relationsToIds(data, fields), { expand })));
    }

    async function update(id: string, data: Partial<TResponse>): Promise<TResponse> {
        return inline(await mapErrors(() => collection.update(id, relationsToIds(data, fields), { expand })));
    }

    async function remove(id: string): Promise<void> {
        await mapErrors(() => collection.delete(id));
    }

    async function getById(id: string): Promise<TResponse | null> {
        return inline(await mapErrors(() => collection.getOne(id, { expand })));
    }

    async function getAll(): Promise<TResponse[]> {
        const records = await mapErrors(() => collection.getFullList({ expand }));
        return records.map(inline);
    }

    async function getList(options: PaginationOptions): Promise<Paginated<TResponse>> {
        const result = await mapErrors(() => collection.getList(options.page, options.perPage, {
            expand,
            sort: sort(options),
        }));

        return new Paginated<TResponse>(result.items.map(inline), result.totalItems, options);
    }

    async function filter(group: FilterGroup<TResponse>, options: PaginationOptions): Promise<Paginated<TResponse>> {
        const expression = filterGroupToPocketBase(group);
        const result = await mapErrors(() => collection.getList(options.page, options.perPage, {
            expand,
            sort: sort(options),
            filter: expression || undefined,
        }));

        return new Paginated<TResponse>(result.items.map(inline), result.totalItems, options);
    }

    return { create, update, remove, getAll, getById, getList, filter };
}
