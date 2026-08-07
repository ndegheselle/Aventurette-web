// @chapelure/core — framework-free, backend-free contracts.
//
// Nothing in this package may import vue, a backend SDK, or the consuming app.
// That is what makes it the one layer a framework or backend migration does not touch.

export type { BaseEntity } from './data/entity';

export {
    Paginated,
    PaginationOptions,
    SortDirection,
} from './data/crud';
export type { CrudFactory, IDataCrud } from './data/crud';

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
