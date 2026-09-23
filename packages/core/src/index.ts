// @chapelure/core — the contracts. Never import vue, a backend SDK or the app from here.

export type { BaseEntity, Entity } from './data/entity';
export { distinctById } from './data/entity';

export { SortDirection } from './data/crud';
export type { CrudFactory, IDataCrud, Paginated, PaginationOptions } from './data/crud';
export type { EntityMapper } from './data/mapper';

export {
    createFilter,
    createGroup,
    createSearchFilter,
    FilterLogical,
    FilterOperator,
    isFilterGroup,
    removeEmptyFilters,
} from './data/filters';
export type { Filter, FilterGroup } from './data/filters';

export type { IAuthProvider } from './auth/provider';
export type { IFileUrlResolver } from './files/resolver';

export {
    NotAuthentifiedError,
    NotImplementedError,
    ValidationError,
} from './errors';
export type { FieldErrors } from './errors';

export { addDays, endOfMonth, formatDate } from './utils/date';
export { debounce } from './utils/debounce';
export { Deferred } from './utils/deferred';
