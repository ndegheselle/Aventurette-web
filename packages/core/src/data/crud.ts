import type { BaseEntity } from "./entity";
import type { FilterGroup } from "./filters";
import type { EntityMapper } from "./mapper";

export enum SortDirection {
    ASC = '+',
    DESC = '-',
}

/** Page numbers start at 1. */
export class PaginationOptions {
    page: number;
    perPage: number;
    sortBy?: string;
    sortDirection?: SortDirection;

    constructor(page: number, perPage: number, sortBy: string | undefined = undefined, sortDirection: SortDirection | undefined = undefined) {
        this.page = page;
        this.perPage = perPage;
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
    }
}

export class Paginated<T> {
    items: T[];
    total: number;
    options: PaginationOptions;

    constructor(items: T[], total: number, options: PaginationOptions) {
        this.items = items;
        this.total = total;
        this.options = options;
    }
}

export interface IDataCrud<TResponse extends BaseEntity> {
    create(data: TResponse): Promise<TResponse>;
    update(id: string, data: Partial<TResponse>): Promise<TResponse>;
    remove(id: string): Promise<void>;

    getById(id: string): Promise<TResponse | null>;
    getAll(): Promise<TResponse[]>;
    getList(options: PaginationOptions): Promise<Paginated<TResponse>>;
    filter(group: FilterGroup<TResponse>, options: PaginationOptions): Promise<Paginated<TResponse>>;
}

/**
 * Builds a CRUD service for one collection. Wire one factory at startup; each api module asks
 * it for its own collection.
 *
 * @param collection name of the collection / table / endpoint
 * @param mapper the model's translation between payload and entity, and the relations it needs
 */
export type CrudFactory = <TPayload extends BaseEntity, TEntity extends BaseEntity>(
    collection: string,
    mapper: EntityMapper<TPayload, TEntity>
) => IDataCrud<TEntity>;
