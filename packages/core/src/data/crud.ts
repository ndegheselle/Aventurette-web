import type { BaseEntity } from "./entity";
import type { FilterGroup } from "./filters";

export enum SortDirection {
    ASC = '+',
    DESC = '-',
}

/**
 * Pagination options for list. Page number starts from 1.
 */
export class PaginationOptions {
    /**
     * Current page number (starting from 1)
     */
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

/**
 * Paginated items with total count and pagination options used for the query.
 */
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
 * Builds a CRUD service for one collection. This is the seam a backend adapter plugs into:
 * the app wires one factory at startup and every repository asks it for its collection.
 *
 * @param collection name of the collection / table / endpoint
 * @param relations related records to fetch alongside each entity (PocketBase "expand",
 *                  SQL joins, GraphQL selection sets — the concept exists in most backends)
 */
export type CrudFactory = <TResponse extends BaseEntity>(
    collection: string,
    relations?: string[]
) => IDataCrud<TResponse>;
