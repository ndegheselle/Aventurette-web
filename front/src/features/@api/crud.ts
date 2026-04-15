import type { BaseSystemFields } from "@api/types.g";
export type BaseEntity = BaseSystemFields;

export enum SortDirection {
    ASC = '+',
    DESC = '-',
}

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

export class Paginated<T> {
    data: T[];
    total: number;
    options: PaginationOptions;

    constructor(data: T[], total: number, options: PaginationOptions) {
        this.data = data;
        this.total = total;
        this.options = options;
    }
}

export interface IDataCrud<TResponse extends BaseEntity> {
    create(data: TResponse): Promise<TResponse>;
    update(id: string, data: Partial<TResponse>): Promise<TResponse>;
    delete(id: string): Promise<void>;

    getById(id: string): Promise<TResponse | null>;
    getAll(): Promise<TResponse[]>;
    getList(options: PaginationOptions): Promise<Paginated<TResponse>>;
    search(search: string, options: PaginationOptions): Promise<Paginated<TResponse>>;
}