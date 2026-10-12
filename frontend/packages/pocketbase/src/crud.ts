import { type Paginated, type PaginationOptions, type BaseEntity, type EntityMapper, type FilterGroup, type IDataCrud } from "@chapelure/core";
import type PocketBase from 'pocketbase';
import { mapErrors, NOT_FOUND, statusOf, toValidationError } from "./errors";
import { createPocketBaseFileUrls } from "./files";
import { filterGroupToPocketBase } from "./filters";

/**
 * IDataCrud backed by one PocketBase collection. Only the port is handed back: the client stays
 * closed over here, so no caller can reach around the seam.
 *
 * The wire shape stops here: every record goes through the model's mapper on the way out, and
 * every write through it on the way in. What to expand comes from the same mapper, so a
 * relation it reads is a relation the request asked for.
 */
export function createPocketBaseCrud<TPayload extends BaseEntity, TEntity extends BaseEntity>(
    client: PocketBase,
    collectionName: string,
    mapper: EntityMapper<TPayload, TEntity>
): IDataCrud<TEntity> {
    const collection = client.collection(collectionName);
    const files = createPocketBaseFileUrls(client);
    const expand = mapper.relations.length ? mapper.relations.join(",") : undefined;

    function sort(options: PaginationOptions): string | undefined {
        return options.sortBy ? `${options.sortDirection}${options.sortBy}` : undefined;
    }

    function toEntity(record: unknown): TEntity {
        return mapper.toEntity(record as TPayload, files);
    }

    async function create(data: TEntity): Promise<TEntity> {
        const payload = mapper.toPayload(data);
        const record = await mapErrors(() => collection.create(payload, { expand }));
        return toEntity(record);
    }

    async function update(id: string, data: Partial<TEntity>): Promise<TEntity> {
        const payload = mapper.toPayload(data);
        const record = await mapErrors(() => collection.update(id, payload, { expand }));
        return toEntity(record);
    }

    async function remove(id: string): Promise<void> {
        await mapErrors(() => collection.delete(id));
    }

    /** Null for an id with no record behind it: the port reads a missing record as data. */
    async function getById(id: string): Promise<TEntity | null> {
        let record: unknown;
        try {
            record = await collection.getOne(id, { expand });
        } catch (error) {
            if (statusOf(error) === NOT_FOUND) return null;
            throw toValidationError(error) ?? error;
        }

        return toEntity(record);
    }

    async function getAll(): Promise<TEntity[]> {
        const records = await mapErrors(() => collection.getFullList({ expand }));
        return records.map(toEntity);
    }

    async function filter(group: FilterGroup<TEntity>, options: PaginationOptions): Promise<Paginated<TEntity>> {
        const expression = filterGroupToPocketBase(group);
        const result = await mapErrors(() => collection.getList(options.page, options.perPage, {
            expand,
            sort: sort(options),
            filter: expression || undefined,
        }));

        return { items: result.items.map(toEntity), total: result.totalItems, options };
    }

    return { create, update, remove, getAll, getById, filter };
}
