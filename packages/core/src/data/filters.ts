/**
 * Filter comparaison operators.
 */
export const FilterOperator = {
    Equals: 'equals',
    Contains: 'contains',
    GreaterThan: 'greaterThan',
    LessThan: 'lessThan',

    AnyEquals: 'anyEquals'
} as const;
export type FilterOperator = typeof FilterOperator[keyof typeof FilterOperator];

/**
 * Filter logical operators for combining filters.
 */
export const FilterLogical = {
    Or: 'or',
    And: 'and'
} as const;
export type FilterLogical = typeof FilterLogical[keyof typeof FilterLogical];

/**
 * Single field filter, each filter can be combined with other filters using the combine property.
 */
export interface Filter<T> {
    key: keyof T;
    value: any;
    operator: FilterOperator;
    combine: FilterLogical;
}

/**
 * Group of filters, can contain other groups or filters, and has a combine property to specify how the filters are combined.
 */
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

/**
 * Create a search filter based on a search string and a list of keys to search in.
 * @returns a FilterGroup with filters for each key, combined with OR, or null if the search string is empty.
 */
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

/**
 * Remove empty filters (group with no filters, or filter with empty value).
 * @param group
 * @returns cleaned group, or null if the group is empty
 */
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
