export const FilterOperator = {
    Equals: 'equals',
    Contains: 'contains',
    GreaterThan: 'greaterThan',
    LessThan: 'lessThan',
    /** Inclusive bounds. A range overlaps another when its ends touch, so `>` would drop it. */
    GreaterOrEquals: 'greaterOrEquals',
    LessOrEquals: 'lessOrEquals',

    AnyEquals: 'anyEquals'
} as const;
export type FilterOperator = typeof FilterOperator[keyof typeof FilterOperator];

export const FilterLogical = {
    Or: 'or',
    And: 'and'
} as const;
export type FilterLogical = typeof FilterLogical[keyof typeof FilterLogical];

/** One field comparison. `combine` joins it to whatever follows it in the group. */
export interface Filter<T> {
    key: keyof T;
    value: any;
    operator: FilterOperator;
    combine: FilterLogical;
}

/** Filters and nested groups, combined as `combine` says. */
export interface FilterGroup<T> {
    filters: (Filter<T> | FilterGroup<T>)[];
    combine: FilterLogical;
}

export function createFilter<T>(filter: Partial<Filter<T>>): Filter<T> {
    return {
        operator: FilterOperator.Contains,
        combine: FilterLogical.And,
        ...filter,
    } as Filter<T>;
}

export function createGroup<T>(group: Partial<FilterGroup<T>>): FilterGroup<T> {
    return {
        combine: FilterLogical.And,
        filters: [],
        ...group,
    } as FilterGroup<T>;
}

/** One OR group matching `search` against every key. Null for an empty search. */
export function createSearchFilter<T>(search: string, keys: (keyof T)[]): FilterGroup<T> | null
{
    if (!search)
        return null;

    return createGroup({
        filters: keys.map(k => createFilter({
            key: k,
            value: search,
            combine: FilterLogical.Or
        }))
    });
}

export function isFilterGroup<T>(filter: Filter<T> | FilterGroup<T>): filter is FilterGroup<T> {
    return 'filters' in filter;
}

/** Drop filters with no value. An untouched form builds a group the backend never sees. */
export function removeEmptyFilters<T>(group: FilterGroup<T>): FilterGroup<T> {
    const cleanedFilters = group.filters
        .map(f => {
            if (isFilterGroup(f)) {
                return removeEmptyFilters(f);
            } else {
                if (Array.isArray(f.value)) return f.value.length ? f : null;
                return f.value ? f : null;
            }
        })
        .filter((f): f is Filter<T> | FilterGroup<T> => f !== null);
    return {
        ...group,
        filters: cleanedFilters
    };
}
