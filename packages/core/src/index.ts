// @chapelure/core — the contracts. Never import vue, a backend SDK or the app from here.

export { distinctById } from './data/entity';
export type { BaseEntity, Entity } from './data/entity';

export type { BatchFactory, IBatchCollection, IDataBatch, IdFactory } from './data/batch';
export { SortDirection } from './data/crud';
export type { CrudFactory, IDataCrud, Paginated, PaginationOptions } from './data/crud';
export { emptyIfNull, omit, plainMapper, toEntities, toIds, type EntityMapper } from './data/mapper';

export {
    createFilter,
    createGroup,
    createSearchFilter,
    FilterLogical,
    FilterOperator,
    isFilterGroup,
    removeEmptyFilters
} from './data/filters';
export type { Filter, FilterGroup } from './data/filters';

export type { IAuthProvider } from './auth/provider';
export type { IFileUrlResolver } from './files/resolver';

export {
    BatchError,
    NotAuthenticatedError,
    NotImplementedError,
    ValidationError
} from './errors';
export type { FieldErrors } from './errors';

export { debounce } from './utils/debounce';
export { Deferred } from './utils/deferred';

